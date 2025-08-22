// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MastiMovies is Ownable, ReentrancyGuard {
    struct Movie {
        uint256 id;
        string title;
        string genre;
        uint256 duration; // in minutes
        string bannerHash;
        uint256 pricePerTicket;
        bool isActive;
    }
    
    struct Theater {
        uint256 id;
        string name;
        string location;
        uint256 lat;
        uint256 lng;
        uint256[] movieIds;
        uint256 totalSeats;
        bool isActive;
    }
    
    struct Booking {
        uint256 id;
        uint256 movieId;
        uint256 theaterId;
        address user;
        uint256[] seatNumbers;
        uint256 totalAmount;
        string upiId;
        uint256 showTime;
        uint256 timestamp;
        bool isCancelled;
    }
    
    struct ShowTime {
        uint256 id;
        uint256 movieId;
        uint256 theaterId;
        uint256 time; // Unix timestamp
    }

    uint256 public nextMovieId = 1;
    uint256 public nextTheaterId = 1;
    uint256 public nextBookingId = 1;
    uint256 public nextShowTimeId = 1;
    
    mapping(uint256 => Movie) public movies;
    mapping(uint256 => Theater) public theaters;
    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => ShowTime) public showTimes;
    mapping(address => uint256[]) public userBookings;
    mapping(uint256 => mapping(uint256 => address)) public seatToOwner; // showTimeId => seatNumber => owner
    mapping(uint256 => uint256[]) public showTimeSeats; // showTimeId => seatNumbers
    
    event MovieAdded(uint256 movieId, string title);
    event TheaterAdded(uint256 theaterId, string name);
    event ShowTimeAdded(uint256 showTimeId, uint256 movieId, uint256 theaterId);
    event TicketBooked(uint256 bookingId, address user);
    event TicketCancelled(uint256 bookingId);
    event SeatsBooked(uint256 showTimeId, uint256[] seatNumbers, address buyer);
    
    modifier onlyAdmin() {
        require(msg.sender == owner(), "Only admin can call this");
        _;
    }
    
    constructor() {
        // Initialize with some default data if needed
    }
    
    // Add your existing functions (addMovie, addTheater, etc.) here...
    // Keep all the previous functions unchanged...

    function bookSeats(
        uint256 showtimeId,
        uint256[] memory seatNumbers
    ) public payable nonReentrant {
        require(seatNumbers.length > 0, "Must select at least one seat");
        require(showTimes[showtimeId].id != 0, "Showtime does not exist");
        
        ShowTime memory showtime = showTimes[showtimeId];
        Movie memory movie = movies[showtime.movieId];
        Theater memory theater = theaters[showtime.theaterId];
        
        require(movie.isActive, "Movie not available");
        require(theater.isActive, "Theater not available");
        require(block.timestamp < showtime.time, "Show time has passed");
        
        uint256 totalAmount = movie.pricePerTicket * seatNumbers.length;
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Book seats
        for(uint i = 0; i < seatNumbers.length; i++) {
            require(seatNumbers[i] > 0 && seatNumbers[i] <= theater.totalSeats, "Invalid seat number");
            require(seatToOwner[showtimeId][seatNumbers[i]] == address(0), "Seat already booked");
            seatToOwner[showtimeId][seatNumbers[i]] = msg.sender;
            showTimeSeats[showtimeId].push(seatNumbers[i]);
        }
        
        // Create booking record
        bookings[nextBookingId] = Booking({
            id: nextBookingId,
            movieId: showtime.movieId,
            theaterId: showtime.theaterId,
            user: msg.sender,
            seatNumbers: seatNumbers,
            totalAmount: totalAmount,
            upiId: "",
            showTime: showtime.time,
            timestamp: block.timestamp,
            isCancelled: false
        });
        
        userBookings[msg.sender].push(nextBookingId);
        
        emit SeatsBooked(showtimeId, seatNumbers, msg.sender);
        emit TicketBooked(nextBookingId, msg.sender);
        nextBookingId++;
    }

    function _isSeatBooked(uint256 showtimeId, uint256 seatNumber) internal view returns (bool) {
        return seatToOwner[showtimeId][seatNumber] != address(0);
    }

    function getBookedSeats(uint256 showtimeId) public view returns (uint256[] memory) {
        return showTimeSeats[showtimeId];
    }

    function getAvailableSeats(uint256 showtimeId) public view returns (uint256[] memory) {
        ShowTime memory showtime = showTimes[showtimeId];
        Theater memory theater = theaters[showtime.theaterId];
        uint256[] memory availableSeats = new uint256[](theater.totalSeats);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= theater.totalSeats; i++) {
            if (!_isSeatBooked(showtimeId, i)) {
                availableSeats[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = availableSeats[i];
        }
        
        return finalResult;
    }

    // Update cancelBooking to work with new seat tracking
    function cancelBooking(uint256 _bookingId) external nonReentrant {
        require(bookings[_bookingId].user == msg.sender, "Not your booking");
        require(!bookings[_bookingId].isCancelled, "Already cancelled");
        require(block.timestamp < bookings[_bookingId].showTime, "Show time has passed");
        
        // Free up seats
        for (uint256 i = 0; i < bookings[_bookingId].seatNumbers.length; i++) {
            seatToOwner[bookings[_bookingId].theaterId][bookings[_bookingId].seatNumbers[i]] = address(0);
            // Note: The seat remains in showTimeSeats array, but marked as available
        }
        
        // Refund
        payable(msg.sender).transfer(bookings[_bookingId].totalAmount);
        
        // Mark as cancelled
        bookings[_bookingId].isCancelled = true;
        
        emit TicketCancelled(_bookingId);
    }

    // Keep all other existing functions...
}