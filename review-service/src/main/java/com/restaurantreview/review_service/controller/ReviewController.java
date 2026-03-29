package com.restaurantreview.review_service.controller;

import com.restaurantreview.review_service.dto.ReviewCreationRequest;
import com.restaurantreview.review_service.dto.ReviewsResponse;
import com.restaurantreview.review_service.exception.UserNotOwnerException;
import com.restaurantreview.review_service.model.Review;
import com.restaurantreview.review_service.service.JwtService;
import com.restaurantreview.review_service.service.ReviewService;
import jakarta.validation.Valid;
import java.util.NoSuchElementException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

  @Autowired ReviewService reviewService;

  @Autowired private JwtService jwtService;

  @GetMapping("/")
  public ResponseEntity<ReviewsResponse> getAllReviews(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int pageSize) {
    try {
      Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
      ReviewsResponse response = reviewService.findReviews(pageable);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @PostMapping("/create")
  public ResponseEntity<Review> createReview(
      @Valid @RequestBody ReviewCreationRequest reviewCreationRequest) {
    try {
      long userId = jwtService.extractUserId();
      Review newReview = reviewService.createReview(userId, reviewCreationRequest);
      return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    } catch (UserNotOwnerException e) {
      return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @DeleteMapping("/review/{id}")
  public ResponseEntity<?> deleteReview(@PathVariable Long id) {
    try {
      long userId = jwtService.extractUserId();
      reviewService.deleteReview(userId, id);
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (UserNotOwnerException e) {
      return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    } catch (NoSuchElementException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }
}
