package com.restaurantreview.user_service.controller;

import com.restaurantreview.user_service.dto.UserDTO;
import com.restaurantreview.user_service.dto.UserLoginRequest;
import com.restaurantreview.user_service.dto.UserLoginResponse;
import com.restaurantreview.user_service.dto.UserRegisterRequest;
import com.restaurantreview.user_service.exception.EmailAlreadyExistsException;
import com.restaurantreview.user_service.exception.UserNotRegisteredException;
import com.restaurantreview.user_service.model.UserAccount;
import com.restaurantreview.user_service.service.JwtService;
import com.restaurantreview.user_service.service.UserService;
import jakarta.validation.Valid;
import java.util.NoSuchElementException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

  @Autowired private UserService userService;

  @Autowired private JwtService jwtService;

  @PostMapping("/register")
  public ResponseEntity<UserDTO> registerUser(
      @Valid @RequestBody UserRegisterRequest userRegisterRequest) {
    try {
      UserAccount registeredUser = userService.registerUser(userRegisterRequest);
      UserDTO user = new UserDTO(registeredUser.getEmail(), registeredUser.getUsername());
      return new ResponseEntity<>(user, HttpStatus.CREATED);
    } catch (EmailAlreadyExistsException e) {
      return new ResponseEntity<>(null, HttpStatus.CONFLICT);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> loginUser(@Valid @RequestBody UserLoginRequest userLoginRequest) {
    try {
      UserAccount loggedUser = userService.loginUser(userLoginRequest);
      String jwtToken = jwtService.generateToken(loggedUser.getId());
      UserDTO user = new UserDTO(loggedUser.getEmail(), loggedUser.getUsername());
      return new ResponseEntity<>(new UserLoginResponse(jwtToken, user), HttpStatus.OK);
    } catch (UserNotRegisteredException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/user/{id}")
  public ResponseEntity<?> getUserById(@PathVariable Long id) {
    try {
      UserAccount foundUser = userService.getUserById(id);
      UserDTO user = new UserDTO(foundUser.getEmail(), foundUser.getUsername());
      return new ResponseEntity<>(user, HttpStatus.OK);
    } catch (NoSuchElementException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }
}
