document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8081/api';

    // Elements
    const eventsGrid = document.getElementById('eventsGrid');
    
    // Booking Elements
    const bookingModal = document.getElementById('bookingModal');
    const ticketBookingForm = document.getElementById('ticketBookingForm');
    const selectedEventInfo = document.getElementById('selectedEventInfo');
    const bookEventTitle = document.getElementById('bookEventTitle');
    const bookEventDate = document.getElementById('bookEventDate');
    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');

    // Payment Elements
    const paymentModal = document.getElementById('paymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentSummaryInfo = document.getElementById('paymentSummaryInfo');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    
    // Auth Elements
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const emailGroup = document.getElementById('emailGroup');
    const fullNameGroup = document.getElementById('fullNameGroup');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const authMessage = document.getElementById('authMessage');
    
    // Bookings Elements
    const bookingsModal = document.getElementById('bookingsModal');
    const bookingsList = document.getElementById('bookingsList');

    // Nav Links
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const viewBookingsBtn = document.getElementById('viewBookingsBtn');
    const loginNav = document.getElementById('loginNav');
    const logoutNav = document.getElementById('logoutNav');
    const myBookingsNav = document.getElementById('myBookingsNav');

    // State
    let isLoginMode = true;
    let token = localStorage.getItem('token');
    let currentEventPrice = 0;
    let currentBookingData = null;
    
    const eventsData = [
        { id: 1, title: 'Summer Music Festival (Song)', type: 'Concert', date: '2026-10-15', price: 1500, img: 'images/music_festival.png' },
        { id: 2, title: 'Urban Dance Battle', type: 'Dance', date: '2026-11-20', price: 800, img: 'images/urban_dance.png' },
        { id: 3, title: 'Weekend Standup Comedy', type: 'Comedy', date: '2026-09-10', price: 450, img: 'images/standup_comedy.png' },
        { id: 4, title: 'Acoustic Song Night', type: 'Music', date: '2026-12-05', price: 600, img: 'images/acoustic_song.png' },
        { id: 5, title: 'Classical Ballet Performance', type: 'Dance', date: '2026-11-28', price: 1200, img: 'images/classical_ballet.png' },
        { id: 6, title: 'Late Night Comedy Club', type: 'Comedy', date: '2026-10-02', price: 350, img: 'images/comedy_club_sign.png' }
    ];

    // Initialize
    updateNavState();
    renderEvents();

    // Render Events Grid
    function renderEvents() {
        eventsGrid.innerHTML = '';
        eventsData.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <img src="${event.img}" alt="${event.title}" class="event-img">
                <div class="event-content">
                    <span class="event-type">${event.type}</span>
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-date">📅 ${new Date(event.date).toDateString()}</p>
                    <p class="event-price">₹${event.price}</p>
                    <button class="add-cart-btn" onclick="openBookingModal(${event.id})">Book Ticket</button>
                </div>
            `;
            eventsGrid.appendChild(card);
        });
    }

    // Direct Booking Modal Logic
    window.openBookingModal = (eventId) => {
        if (!token) {
            authModal.classList.remove('hidden');
            showMessage('authMessage', 'Please login or sign up to book tickets.', 'error');
            return;
        }

        const event = eventsData.find(e => e.id === eventId);
        if (event) {
            currentEventPrice = event.price;
            bookEventTitle.value = event.title;
            bookEventDate.value = event.date;
            selectedEventInfo.innerHTML = `
                <h3 style="margin-bottom: 5px; color: #a855f7;">${event.title}</h3>
                <p>Date: ${new Date(event.date).toDateString()}</p>
                <p>Price per ticket: ₹${event.price}</p>
            `;
            ticketBookingForm.reset();
            bookingModal.classList.remove('hidden');
        }
    };

    // Proceed to Payment Submission
    ticketBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentBookingData = {
            eventType: bookEventTitle.value,
            bookingDate: bookEventDate.value,
            ticketCount: document.getElementById('ticketCount').value
        };

        const totalAmt = currentBookingData.ticketCount * currentEventPrice;
        
        paymentSummaryInfo.innerHTML = `
            <p><strong>Event:</strong> ${currentBookingData.eventType}</p>
            <p><strong>Tickets:</strong> ${currentBookingData.ticketCount}</p>
            <h3 style="margin-top:10px; color:#a855f7;">Total Amount: <span style="font-size:1.5rem;">₹${totalAmt}</span></h3>
        `;

        bookingModal.classList.add('hidden');
        paymentForm.reset();
        paymentModal.classList.remove('hidden');
    });

    // Confirm Payment
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            confirmPaymentBtn.disabled = true;
            confirmPaymentBtn.querySelector('.btn-text').textContent = 'Processing...';

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment gateway

            const methodElement = document.querySelector('input[name="payMethod"]:checked');
            if (methodElement) {
                currentBookingData.paymentMethod = methodElement.value === 'upi' ? 'UPI' : 'Credit/Debit Card';
            }

            const response = await fetch(API_URL + '/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentBookingData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                paymentModal.classList.add('hidden');
                alert(result.message || 'Payment successful! Tickets booked.');
            } else {
                showMessage('paymentFormMessage', result.message || 'Failed to book tickets.', 'error');
            }
        } catch (error) {
            showMessage('paymentFormMessage', 'Network error. Please try again.', 'error');
        } finally {
            confirmPaymentBtn.disabled = false;
            confirmPaymentBtn.querySelector('.btn-text').textContent = 'Pay & Confirm Booking';
        }
    });

    // User State Logic
    function updateNavState() {
        if (token) {
            loginNav.classList.add('hidden');
            logoutNav.classList.remove('hidden');
            myBookingsNav.classList.remove('hidden');
        } else {
            loginNav.classList.remove('hidden');
            logoutNav.classList.add('hidden');
            myBookingsNav.classList.add('hidden');
        }
    }

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        token = null;
        localStorage.removeItem('token');
        updateNavState();
        alert('Logged out safely');
    });

    // Modals visibility
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = true;
        updateAuthForm();
        authModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-booking-btn, .close-payment-btn, .close-btn, .close-auth-btn, .close-bookings-btn').forEach(btn => {
        if(btn) {
            btn.addEventListener('click', () => {
                bookingModal.classList.add('hidden');
                paymentModal.classList.add('hidden');
                authModal.classList.add('hidden');
                bookingsModal.classList.add('hidden');
            });
        }
    });

    // Auth Submit
    authSwitchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateAuthForm();
    });

    function updateAuthForm() {
        authTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        document.getElementById('authSubmitBtn').querySelector('.btn-text').textContent = isLoginMode ? 'Login' : 'Sign Up';
        authSwitchText.textContent = isLoginMode ? "Don't have an account? " : "Already have an account? ";
        authSwitchBtn.textContent = isLoginMode ? "Sign Up" : "Login";
        
        if (isLoginMode) {
            emailGroup.classList.add('hidden');
            fullNameGroup.classList.add('hidden');
            document.getElementById('email').required = false;
            document.getElementById('fullName').required = false;
        } else {
            emailGroup.classList.remove('hidden');
            fullNameGroup.classList.remove('hidden');
            document.getElementById('email').required = true;
            document.getElementById('fullName').required = true;
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const email = document.getElementById('email').value.trim();
        const fullName = document.getElementById('fullName').value.trim();

        if (!username || !password) {
            showMessage('authMessage', 'Username and Password are required.', 'error');
            return;
        }

        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const body = { username, password };
        
        if (!isLoginMode) {
            if (!email || !fullName) {
                showMessage('authMessage', 'Email and Full Name are strictly required for signing up.', 'error');
                return;
            }
            body.email = email;
            body.fullName = fullName;
        }

        try {
            const response = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.success) {
                if (isLoginMode) {
                    token = result.token;
                    localStorage.setItem('token', token);
                    authModal.classList.add('hidden');
                    updateNavState();
                } else {
                    showMessage('authMessage', 'Registration successful! Please login.', 'success');
                    isLoginMode = true;
                    updateAuthForm();
                }
                authForm.reset();
            } else {
                showMessage('authMessage', result.message || 'Authentication failed', 'error');
            }
        } catch (error) {
            showMessage('authMessage', 'Network error.', 'error');
        }
    });

    // My Bookings
    viewBookingsBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        bookingsModal.classList.remove('hidden');
        bookingsList.innerHTML = '<p>Loading...</p>';

        try {
            const response = await fetch(API_URL + '/bookings/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const bookings = await response.json();
                bookingsList.innerHTML = '';
                
                if (bookings.length === 0) {
                    bookingsList.innerHTML = '<p>No bookings found.</p>';
                    return;
                }

                bookings.forEach(b => {
                    const div = document.createElement('div');
                    div.className = 'booking-item';
                    div.innerHTML = `
                        <h4>Booking ID: #${b.id}</h4>
                        <p><strong>Event:</strong> ${b.eventType}</p>
                        <p><strong>Date:</strong> ${b.bookingDate}</p>
                        <p><strong>Tickets:</strong> ${b.ticketCount}</p>
                        <p><strong>Payment Method:</strong> ${b.paymentMethod || 'N/A'}</p>
                    `;
                    bookingsList.appendChild(div);
                });
            }
        } catch (error) {
            bookingsList.innerHTML = '<p>Error loading bookings.</p>';
        }
    });

    function showMessage(elementId, msg, type) {
        const el = document.getElementById(elementId);
        if(el) {
            el.textContent = msg;
            el.className = `form-message ${type}`;
            setTimeout(() => el.classList.add('hidden'), 3000);
        }
    }

    // Toggle Payment Method view logic
    window.togglePaymentMethod = () => {
        const method = document.querySelector('input[name="payMethod"]:checked').value;
        const cardFields = document.getElementById('cardFields');
        const upiFields = document.getElementById('upiFields');
        if (method === 'upi') {
            cardFields.classList.add('hidden');
            upiFields.classList.remove('hidden');
            document.getElementById('cardNumber').required = false;
            document.getElementById('cardExpiry').required = false;
            document.getElementById('cardCvv').required = false;
            document.getElementById('upiId').required = true;
        } else {
            cardFields.classList.remove('hidden');
            upiFields.classList.add('hidden');
            document.getElementById('cardNumber').required = true;
            document.getElementById('cardExpiry').required = true;
            document.getElementById('cardCvv').required = true;
            document.getElementById('upiId').required = false;
        }
    };
});
