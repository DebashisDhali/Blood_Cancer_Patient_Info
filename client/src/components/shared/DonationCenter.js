import React from 'react';

const DonationCenter = ({ fund }) => {
  if (!fund) return <div className="no-info-box">ℹ️ No donation information available.</div>;

  const progress = Math.min(100, (fund.collected_amount / (fund.target_amount || 1)) * 100);

  return (
    <div className="donation-center-comp">
      <h4 className="section-title">Campaign Financials</h4>
      <div className="fund-visual-progress-box">
        <div className="fund-progress-meta">
          <div className="fund-main-percent">
            {progress.toFixed(1)}%
            <span>Funded</span>
          </div>
          <div className="fund-mini-stats-top">
            <div className="fms-item"><label>Target</label><strong>৳{(fund.target_amount || 0).toLocaleString()}</strong></div>
            <div className="fms-item"><label>Raised</label><strong style={{ color: '#10b981' }}>৳{(fund.collected_amount || 0).toLocaleString()}</strong></div>
          </div>
        </div>
        <div className="fund-progress-bar-large">
          <div className="fund-progress-fill-large" style={{ width: `${progress}%` }}>
            <div className="progress-glow"></div>
          </div>
        </div>
      </div>

      <div className="donation-methods-container">
        {(fund.bank_account_no || fund.bank_name) ? (
          <div className="bank-card-premium">
            <div className="bank-card-header">
              <span>🏛️ DIRECT BANK TRANSFER</span>
              <div className="bank-logo-dummy">BANK</div>
            </div>
            <div className="bank-card-body">
              <h3>{fund.bank_name || 'Bank Details'}</h3>
              {fund.bank_account_no && (
                <div className="bank-acc-row">
                  <label>Account Number</label>
                  <strong>{fund.bank_account_no}</strong>
                </div>
              )}
              {fund.bank_account_name && (
                <div className="bank-acc-row">
                  <label>Account Name</label>
                  <span>{fund.bank_account_name}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-info-box">
            <p>ℹ️ No bank account details provided.</p>
          </div>
        )}

        <div className="mobile-payments-section">
          <h5 className="sub-section-title">Mobile Wallets</h5>
          <div className="mobile-grid-premium">
            {fund.bkash_no && (
              <div className="m-wallet bkash">
                <div className="m-wallet-header">
                  <img src="/images/bkash-logo.png" alt="bKash" className="m-logo" />
                  <label>bKash</label>
                </div>
                <strong>{fund.bkash_no}</strong>
              </div>
            )}
            {fund.nagad_no && (
              <div className="m-wallet nagad">
                <div className="m-wallet-header">
                  <img src="/images/nagad-logo.jpg" alt="Nagad" className="m-logo" />
                  <label>Nagad</label>
                </div>
                <strong>{fund.nagad_no}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCenter;
