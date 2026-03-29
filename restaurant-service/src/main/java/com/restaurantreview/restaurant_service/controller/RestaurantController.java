package com.restaurantreview.restaurant_service.controller;

import com.restaurantreview.restaurant_service.dto.IdAndNameDTO;
import com.restaurantreview.restaurant_service.dto.RestaurantDTO;
import com.restaurantreview.restaurant_service.model.Restaurant;
import com.restaurantreview.restaurant_service.service.JwtService;
import com.restaurantreview.restaurant_service.service.RestaurantService;
import jakarta.validation.Valid;
import java.util.NoSuchElementException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restaurant")
public class RestaurantController {
  @Autowired private RestaurantService restaurantService;

  @Autowired private JwtService jwtService;

  @PostMapping("/create")
  public ResponseEntity<Restaurant> createRestaurant(@Valid @RequestBody RestaurantDTO request) {
    try {
      Restaurant restaurant = restaurantService.createRestaurant(request);
      return new ResponseEntity<>(restaurant, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/restaurant/{id}")
  public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long id) {
    try {
      RestaurantDTO response = restaurantService.getRestaurantById(id);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (NoSuchElementException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/search")
  public ResponseEntity<Page<IdAndNameDTO>> searchRestaurantsByName(
      @RequestParam String partialName,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int pageSize) {
    try {
      Page<IdAndNameDTO> response =
          restaurantService.searchRestaurantsByName(partialName, PageRequest.of(page, pageSize));
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (NoSuchElementException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }
}
