package com.ticketbooking.controller;

import com.ticketbooking.model.Booking;
import com.ticketbooking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // Allows requests from VS Code Live Server (e.g., http://localhost:5500)
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(bookingRepository.findByUsername(username));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveBooking(@RequestBody Booking booking) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            booking.setUsername(username);
            Booking savedBooking = bookingRepository.save(booking);
            response.put("success", true);
            response.put("message", "Booking confirmed!");
            response.put("bookingId", savedBooking.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while saving the booking.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
