import React from 'react';
import '../styles/DonationForm.css';

const DonationForm = ({ patientName, targetAmount, collectedAmount }) => {
  const remaining = targetAmount - collectedAmount;
  const progress = ((collectedAmount / targetAmount) * 100).toFixed(2);

  return (
    <div className="donation-form">
      <h3>💰 Help {patientName}</h3>
      
      <div className="fund-summary">
        <div className="fund-stat">
          <p className="stat-label">Target Amount</p>
          <p className="stat-value">৳{targetAmount.toLocaleString()}</p>
        </div>
        
        <div className="fund-stat">
          <p className="stat-label">Collected</p>
          <p className="stat-value">৳{collectedAmount.toLocaleString()}</p>
        </div>
        
        <div className="fund-stat">
          <p className="stat-label">Remaining</p>
          <p className="stat-value">৳{remaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{progress}% Collected</p>
      </div>

      <div className="donation-methods">
        <h4>🤝 How to Help</h4>
        
        <div className="method">
          <h5>1. Bank Transfer</h5>
          <p className="info-text">Direct bank transfer to patient's account</p>
          <p className="note">Please contact us for banking details</p>
        </div>

        <div className="method">
          <h5>2. Mobile Banking (Bangladesh)</h5>
          <div className="banking-options">
            <p>💳 <strong>Bkash:</strong> Contact for account number</p>
            <p>💳 <strong>Nagad:</strong> Contact for account number</p>
            <p>💳 <strong>Rocket:</strong> Contact for account number</p>
          </div>
          <p className="note">Fast and secure mobile money transfer</p>
        </div>

        <div className="method">
          <h5>3. Through Organization</h5>
          <p className="info-text">Donate through verified fundraising organization</p>
          <p className="note">For transparency and accountability</p>
        </div>

        <div className="method">
          <h5>4. International Transfer</h5>
          <p className="info-text">If donating from outside Bangladesh</p>
          <p className="note">SWIFT/Wire transfer available</p>
        </div>
      </div>

      <div className="donation-message">
        <h4>✨ Your Support Matters!</h4>
        <p>
          Every donation helps cover:
        </p>
        <ul>
          <li>💊 Chemotherapy treatments</li>
          <li>🏥 Hospital expenses</li>
          <li>💉 Medical tests and procedures</li>
          <li>🚑 Transportation to hospital</li>
          <li>🍎 Nutritious food during recovery</li>
        </ul>
        <p className="thank-you">
          Thank you for being part of the healing journey! 🙏
        </p>
      </div>

      <div className="contact-info">
        <p><strong>📞 For donation details:</strong></p>
        <p>Please contact the organization or family directly</p>
        <p className="small-text">All donations are transparent and used only for medical purposes</p>
      </div>
    </div>
  );
};

export default DonationForm;
