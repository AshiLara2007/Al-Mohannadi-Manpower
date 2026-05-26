'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    e.target.reset();
  };

  return (
    <div className="py-32 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Have questions? We'd love to hear from you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="First Name" className="form-input" required />
          <input type="text" placeholder="Last Name" className="form-input" required />
        </div>
        <input type="email" placeholder="Email Address" className="form-input" required />
        <input type="tel" placeholder="Phone Number" className="form-input" required />
        <textarea rows="5" placeholder="Your Message" className="form-input" required></textarea>
        <button type="submit" className="btn-primary w-full md:w-auto">Send Message <i className="fa-solid fa-paper-plane"></i></button>
      </form>
      
      {submitted && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-center">
          Thank you! Your message has been sent successfully.
        </div>
      )}
    </div>
  );
}