import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from 'context/CartContext';
import { placeOrder } from 'services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    houseNo: '',
    streetName: '',
    address: '',
    city: '',
    district: '',
    taluk: '',
    postalCode: '',
    country: 'India', // Default to India
  });

  const handleChange = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Basic validation for shipping details
    if (Object.values(shippingDetails).some(detail => detail === '')) {
      alert('Please fill in all shipping details.');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      navigate('/');
      return;
    }

    try {
      await placeOrder(shippingDetails);
      alert('Order Placed Successfully!');
      clearCart();
      navigate('/account'); // Redirect to account page to see order history
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    }
  };

  const renderStep1 = () => (
    <motion.form 
      onSubmit={handleNextStep} 
      className="space-y-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
        <p className="font-bold">Service Availability Notice</p>
        <p>Currently, our services are exclusively available within India. We are actively working on expanding our reach and will announce availability in other countries soon. If you are located outside India, we kindly request you to exit this page at this time. Thank you for your understanding.</p>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Shipping Details</h2>
      <div>
        <label htmlFor="fullName" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Full Name</label>
        <input type="text" id="fullName" name="fullName" value={shippingDetails.fullName} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="houseNo" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">House No./Building Name</label>
        <input type="text" id="houseNo" name="houseNo" value={shippingDetails.houseNo} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="streetName" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Street Name/Locality</label>
        <input type="text" id="streetName" name="streetName" value={shippingDetails.streetName} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Address Line (Optional)</label>
        <input type="text" id="address" name="address" value={shippingDetails.address} onChange={handleChange}
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">City</label>
        <input type="text" id="city" name="city" value={shippingDetails.city} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="district" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">District</label>
        <input type="text" id="district" name="district" value={shippingDetails.district} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="taluk" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Taluk</label>
        <input type="text" id="taluk" name="taluk" value={shippingDetails.taluk} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="postalCode" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Postal Code</label>
        <input type="text" id="postalCode" name="postalCode" value={shippingDetails.postalCode} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <div>
        <label htmlFor="country" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Country</label>
        <input type="text" id="country" name="country" value={shippingDetails.country} onChange={handleChange} required
          className="shadow appearance-none border border-gray-200 rounded-lg w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
             dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
        />
      </div>
      <button type="submit"
        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full
                             dark:bg-dark_primary dark:hover:bg-dark_primary-dark"
      >
        Proceed to Payment
      </button>
    </motion.form>
  );

  const renderStep2 = () => (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Order Confirmation</h2>
      <div className="bg-surface/50 rounded-lg p-6 border border-gray-200 dark:bg-dark_surface/50 dark:border-dark_surface/50">
        <h3 className="text-xl font-semibold text-text-light mb-2 dark:text-dark_text-light">Shipping To:</h3>
        <p className="text-text-default dark:text-dark_text-default">{shippingDetails.fullName}</p>
        <p className="text-text-default dark:text-dark_text-default">{shippingDetails.address}</p>
        <p className="text-text-default dark:text-dark_text-default">{shippingDetails.city}, {shippingDetails.postalCode}</p>
        <p className="text-text-default dark:text-dark_text-default">{shippingDetails.country}</p>
      </div>
      {/* Display cart summary and total here */}
      <div className="bg-surface/50 rounded-lg p-6 border border-gray-200 dark:bg-dark_surface/50 dark:border-dark_surface/50">
        <h3 className="text-xl font-semibold text-text-light mb-2 dark:text-dark_text-light">Order Summary:</h3>
        {cartItems.map(item => (
          <div key={item.product._id} className="flex justify-between text-text-default dark:text-dark_text-default">
            <span>{item.product.name} x {item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2 text-text-light dark:border-dark_surface/50 dark:text-dark_text-light">
          <span>Total:</span>
          <span>${cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)}</span>
        </div>
      </div>
      <p className="text-text-default dark:text-dark_text-default">Review your order details before placing.</p>
      <div className="flex justify-between space-x-4">
        <button onClick={() => setStep(1)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full
             dark:bg-gray-700 dark:hover:bg-gray-800"
        >
          Back to Shipping
        </button>
        <button onClick={handlePlaceOrder}
          className="bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full
             dark:bg-dark_secondary dark:hover:bg-dark_secondary-dark"
        >
          Place Order
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light text-center dark:text-dark_text-light">Checkout</h1>
      <div className="max-w-2xl mx-auto bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
              dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
};

export default CheckoutPage;
