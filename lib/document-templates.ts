// Document Templates for Contract Generation

export interface DocumentData {
    name: string
    role: string
    department: string
    salary?: string
    startDate?: string
    notes?: string
    // Equity specific
    shares?: string
    vestingPeriod?: string
    // Warning specific
    infractionType?: string
    improvementPlan?: string
    // Termination specific
    terminationReason?: string
    lastWorkingDay?: string
    // Promotion specific
    currentRole?: string
    newRole?: string
    salaryIncrease?: string
}

const COMPANY_INFO = {
    name: "Zero HR Inc.",
    address: "123 Business Avenue, Tech City, TC 12345",
    phone: "(555) 123-4567",
    email: "hr@openhire.com"
}

export const generateOfferLetterTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .company-details { font-size: 12px; color: #666; }
    .content { margin: 30px 0; }
    .signature-section { margin-top: 60px; }
    .signature-line { border-top: 1px solid #333; width: 300px; margin-top: 60px; }
    .date { margin-bottom: 30px; }
    h1 { text-align: center; margin: 30px 0; }
    .terms { margin: 20px 0; padding-left: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <div class="company-details">
      ${COMPANY_INFO.address}<br>
      Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}
    </div>
  </div>

  <div class="date">${currentDate}</div>

  <div class="content">
    <p>Dear ${data.name},</p>

    <p>We are pleased to offer you the position of <strong>${data.role}</strong> with ${COMPANY_INFO.name}. We believe your skills and experience will be a valuable asset to our ${data.department} team.</p>

    <h2>Position Details:</h2>
    <div class="terms">
      <p><strong>Position:</strong> ${data.role}</p>
      <p><strong>Department:</strong> ${data.department}</p>
      <p><strong>Annual Salary:</strong> $${data.salary ? Number(data.salary).toLocaleString() : '[Amount]'}</p>
      <p><strong>Start Date:</strong> ${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]'}</p>
    </div>

    <h2>Employment Terms:</h2>
    <div class="terms">
      <p>This is a full-time, at-will employment position. Your employment with ${COMPANY_INFO.name} will be governed by the terms and conditions set forth in our Employee Handbook and applicable company policies.</p>
      
      <p><strong>Compensation:</strong> You will be paid on a bi-weekly basis, subject to applicable taxes and withholdings.</p>
      
      <p><strong>Benefits:</strong> You will be eligible for our comprehensive benefits package, including health insurance, dental and vision coverage, 401(k) retirement plan with company match, paid time off (PTO), and other benefits as described in our benefits documentation.</p>
      
      <p><strong>Work Schedule:</strong> Standard business hours are Monday through Friday, 9:00 AM to 5:00 PM, with flexibility for remote work as approved by your manager.</p>
    </div>

    ${data.notes ? `<h2>Additional Terms:</h2><p>${data.notes}</p>` : ''}

    <p>This offer is contingent upon successful completion of background checks and verification of your eligibility to work in the United States.</p>

    <p>To accept this offer, please sign and return this letter by [Date - typically 7 days from offer date]. We are excited about the prospect of you joining our team and look forward to your positive response.</p>

    <p>If you have any questions, please don't hesitate to contact me.</p>

    <p>Sincerely,</p>

    <div class="signature-section">
      <div class="signature-line"></div>
      <p>HR Director<br>${COMPANY_INFO.name}</p>
    </div>

    <div class="signature-section">
      <p><strong>Acceptance:</strong></p>
      <p>I, ${data.name}, accept the above offer of employment.</p>
      <div class="signature-line"></div>
      <p>Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ______________</p>
    </div>
  </div>

  <div class="footer">
    <p><em>This document constitutes an employment offer and is confidential. Please do not share without authorization.</em></p>
  </div>
</body>
</html>
  `
}

export const generateEmploymentContractTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    h1 { text-align: center; margin: 30px 0; font-size: 20px; }
    .section { margin: 25px 0; }
    .section-title { font-weight: bold; margin: 15px 0 10px 0; }
    .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; }
    ol { padding-left: 25px; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <h1>EMPLOYMENT CONTRACT</h1>
  </div>

  <p>This Employment Contract ("Agreement") is entered into as of ${currentDate}, between:</p>
  
  <p><strong>EMPLOYER:</strong> ${COMPANY_INFO.name}, a corporation with its principal place of business at ${COMPANY_INFO.address}</p>
  
  <p><strong>EMPLOYEE:</strong> ${data.name}</p>

  <div class="section">
    <div class="section-title">1. POSITION AND DUTIES</div>
    <p>The Employee is hired for the position of <strong>${data.role}</strong> in the ${data.department} Department. The Employee agrees to perform all duties and responsibilities associated with this position and such other duties as may be assigned by the Employer from time to time.</p>
  </div>

  <div class="section">
    <div class="section-title">2. COMPENSATION</div>
    <p>The Employee shall receive an annual salary of <strong>$${data.salary ? Number(data.salary).toLocaleString() : '[Amount]'}</strong>, payable in accordance with the Employer's standard payroll practices. This compensation is subject to applicable tax withholdings and deductions.</p>
  </div>

  <div class="section">
    <div class="section-title">3. BENEFITS</div>
    <p>The Employee shall be entitled to participate in all employee benefit plans and programs offered by the Employer to its employees, subject to the terms and conditions of such plans, including but not limited to:</p>
    <ol>
      <li>Health, dental, and vision insurance</li>
      <li>401(k) retirement plan with employer matching</li>
      <li>Paid time off (PTO) in accordance with company policy</li>
      <li>Sick leave and personal days</li>
      <li>Professional development opportunities</li>
    </ol>
  </div>

  <div class="section">
    <div class="section-title">4. TERM OF EMPLOYMENT</div>
    <p>Employment shall commence on <strong>${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]'}</strong>. This is an at-will employment relationship, meaning either party may terminate this agreement at any time, with or without cause, with appropriate notice.</p>
  </div>

  <div class="section">
    <div class="section-title">5. CONFIDENTIALITY</div>
    <p>The Employee agrees to maintain the confidentiality of all proprietary and confidential information of the Employer, both during and after the term of employment. This includes but is not limited to trade secrets, business strategies, customer information, and financial data.</p>
  </div>

  <div class="section">
    <div class="section-title">6. INTELLECTUAL PROPERTY</div>
    <p>Any inventions, discoveries, or works created by the Employee in the course of employment shall be the sole property of the Employer. The Employee agrees to assign all rights, title, and interest in such intellectual property to the Employer.</p>
  </div>

  <div class="section">
    <div class="section-title">7. NON-COMPETE AND NON-SOLICITATION</div>
    <p>During employment and for a period of twelve (12) months following termination, the Employee agrees not to:</p>
    <ol>
      <li>Engage in any business that directly competes with the Employer</li>
      <li>Solicit or attempt to solicit any employees, clients, or customers of the Employer</li>
    </ol>
  </div>

  <div class="section">
    <div class="section-title">8. TERMINATION</div>
    <p>Either party may terminate this Agreement with two (2) weeks' written notice. The Employer may terminate immediately for cause, including but not limited to misconduct, breach of company policy, or unsatisfactory performance.</p>
  </div>

  <div class="section">
    <div class="section-title">9. GOVERNING LAW</div>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the state in which the Employer's principal place of business is located.</p>
  </div>

  ${data.notes ? `<div class="section"><div class="section-title">10. ADDITIONAL TERMS</div><p>${data.notes}</p></div>` : ''}

  <p style="margin-top: 40px;">IN WITNESS WHEREOF, the parties have executed this Employment Contract as of the date first written above.</p>

  <div class="signature-section">
    <div class="signature-block">
      <p><strong>EMPLOYER:</strong></p>
      <div class="signature-line"></div>
      <p>Authorized Representative<br>${COMPANY_INFO.name}</p>
      <p>Date: ______________</p>
    </div>
    
    <div class="signature-block">
      <p><strong>EMPLOYEE:</strong></p>
      <div class="signature-line"></div>
      <p>${data.name}</p>
      <p>Date: ______________</p>
    </div>
  </div>
</body>
</html>
  `
}

export const generatePromotionLetterTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    h1 { text-align: center; margin: 30px 0; color: #2c5aa0; }
    .highlight-box { background-color: #f0f7ff; border-left: 4px solid #2c5aa0; padding: 20px; margin: 20px 0; }
    .signature-section { margin-top: 60px; }
    .signature-line { border-top: 1px solid #333; width: 300px; margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <h1>PROMOTION ANNOUNCEMENT</h1>
  </div>

  <p><strong>Date:</strong> ${currentDate}</p>
  <p><strong>To:</strong> ${data.name}</p>
  <p><strong>From:</strong> Human Resources Department</p>
  <p><strong>Re:</strong> Promotion Notification</p>

  <p>Dear ${data.name},</p>

  <p>It is with great pleasure that we inform you of your promotion within ${COMPANY_INFO.name}. Your exceptional performance, dedication, and contributions to the ${data.department} team have not gone unnoticed.</p>

  <div class="highlight-box">
    <h2 style="margin-top: 0;">Promotion Details:</h2>
    <p><strong>Current Position:</strong> ${data.currentRole || data.role}</p>
    <p><strong>New Position:</strong> ${data.newRole || data.role}</p>
    <p><strong>Department:</strong> ${data.department}</p>
    <p><strong>Salary Adjustment:</strong> ${data.salaryIncrease || 'As discussed'}</p>
    <p><strong>Effective Date:</strong> ${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]'}</p>
  </div>

  <h2>New Responsibilities:</h2>
  <p>In your new role as ${data.newRole || data.role}, you will be responsible for:</p>
  <ul>
    <li>Leading strategic initiatives within the ${data.department} department</li>
    <li>Mentoring and developing junior team members</li>
    <li>Collaborating with cross-functional teams on key projects</li>
    <li>Contributing to departmental planning and decision-making</li>
  </ul>

  <h2>Recognition:</h2>
  <p>This promotion is a testament to your outstanding work ethic, innovative thinking, and commitment to excellence. Your contributions have significantly impacted our team's success, and we are confident that you will continue to excel in this expanded role.</p>

  ${data.notes ? `<h2>Additional Information:</h2><p>${data.notes}</p>` : ''}

  <p>We look forward to your continued success and growth with ${COMPANY_INFO.name}. Congratulations on this well-deserved promotion!</p>

  <p>Please feel free to reach out if you have any questions about your new role or responsibilities.</p>

  <p>Warmest congratulations,</p>

  <div class="signature-section">
    <div class="signature-line"></div>
    <p>HR Director<br>${COMPANY_INFO.name}</p>
  </div>

  <div class="signature-section">
    <p><strong>Acknowledgment:</strong></p>
    <p>I acknowledge receipt of this promotion letter and accept the new position.</p>
    <div class="signature-line"></div>
    <p>${data.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ______________</p>
  </div>
</body>
</html>
  `
}

export const generateWarningNoticeTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #c53030; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    h1 { text-align: center; margin: 30px 0; color: #c53030; }
    .warning-box { background-color: #fff5f5; border: 2px solid #c53030; padding: 20px; margin: 20px 0; }
    .section { margin: 25px 0; }
    .section-title { font-weight: bold; margin: 15px 0 10px 0; text-decoration: underline; }
    .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <h1>WRITTEN WARNING NOTICE</h1>
  </div>

  <p><strong>Date:</strong> ${currentDate}</p>
  <p><strong>Employee Name:</strong> ${data.name}</p>
  <p><strong>Position:</strong> ${data.role}</p>
  <p><strong>Department:</strong> ${data.department}</p>

  <div class="warning-box">
    <p style="margin: 0;"><strong>NOTICE:</strong> This is a formal written warning regarding performance and/or conduct issues. This document will be placed in your personnel file.</p>
  </div>

  <div class="section">
    <div class="section-title">REASON FOR WARNING:</div>
    <p><strong>Infraction Type:</strong> ${data.infractionType || '[Specify infraction]'}</p>
    <p>This warning is issued due to the following concerns:</p>
    <p>${data.notes || '[Detailed description of the issue, including specific incidents, dates, and impact on the organization]'}</p>
  </div>

  <div class="section">
    <div class="section-title">COMPANY POLICY REFERENCE:</div>
    <p>The above-mentioned conduct/performance is in violation of company policies as outlined in the Employee Handbook, specifically:</p>
    <ul>
      <li>Professional Conduct Standards (Section 3.1)</li>
      <li>Performance Expectations (Section 4.2)</li>
      <li>Attendance and Punctuality (Section 5.1)</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">REQUIRED IMPROVEMENT PLAN:</div>
    <p>${data.improvementPlan || 'The employee is required to take the following corrective actions:'}</p>
    <ul>
      <li>Immediate improvement in [specific area]</li>
      <li>Regular check-ins with direct supervisor</li>
      <li>Completion of any required training or development programs</li>
      <li>Demonstration of sustained improvement over the next [timeframe]</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">CONSEQUENCES OF NON-COMPLIANCE:</div>
    <p>Failure to demonstrate immediate and sustained improvement may result in further disciplinary action, up to and including termination of employment. A follow-up review will be conducted on ${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Review Date]'}.</p>
  </div>

  <div class="section">
    <div class="section-title">EMPLOYEE RIGHTS:</div>
    <p>You have the right to respond to this warning in writing within five (5) business days. Your written response will be attached to this warning and placed in your personnel file. You may also request a meeting with HR to discuss this warning.</p>
  </div>

  <p style="margin-top: 40px;">We believe in your ability to improve and hope to see positive changes immediately. If you have any questions or need support in meeting these expectations, please contact Human Resources.</p>

  <div class="signature-section">
    <div class="signature-block">
      <p><strong>Issued By:</strong></p>
      <div class="signature-line"></div>
      <p>Supervisor/Manager Name<br>Title<br>Date: ______________</p>
    </div>
    
    <div class="signature-block">
      <p><strong>Employee Acknowledgment:</strong></p>
      <div class="signature-line"></div>
      <p>${data.name}<br>Date: ______________</p>
      <p style="font-size: 11px; margin-top: 10px;"><em>Signature indicates receipt, not necessarily agreement</em></p>
    </div>
  </div>

  <p style="margin-top: 40px; font-size: 11px; color: #666;"><strong>CC:</strong> Personnel File, HR Department</p>
</body>
</html>
  `
}

export const generateTerminationNoticeTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    h1 { text-align: center; margin: 30px 0; }
    .section { margin: 25px 0; padding: 15px; background-color: #f9f9f9; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .important-box { background-color: #fff3cd; border: 1px solid #856404; padding: 15px; margin: 20px 0; }
    .signature-section { margin-top: 60px; }
    .signature-line { border-top: 1px solid #333; width: 300px; margin-top: 60px; }
    ul { margin: 10px 0; padding-left: 25px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <h1>NOTICE OF EMPLOYMENT TERMINATION</h1>
  </div>

  <p><strong>Date:</strong> ${currentDate}</p>
  <p><strong>Employee Name:</strong> ${data.name}</p>
  <p><strong>Position:</strong> ${data.role}</p>
  <p><strong>Department:</strong> ${data.department}</p>
  <p><strong>Employee ID:</strong> [Employee ID]</p>

  <p>Dear ${data.name},</p>

  <p>This letter serves as formal notification that your employment with ${COMPANY_INFO.name} will be terminated, effective <strong>${data.lastWorkingDay ? new Date(data.lastWorkingDay).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Last Working Date]'}</strong>.</p>

  <div class="section">
    <div class="section-title">REASON FOR TERMINATION:</div>
    <p>${data.terminationReason === 'performance' ? 'Performance-related termination due to failure to meet job requirements and performance standards.' :
            data.terminationReason === 'restructuring' ? 'Position elimination due to organizational restructuring and business requirements.' :
                data.terminationReason === 'misconduct' ? 'Termination for cause due to violation of company policies and code of conduct.' :
                    data.terminationReason === 'resignation' ? 'Voluntary resignation as submitted by employee.' :
                        '[Reason for termination]'}</p>
    ${data.notes ? `<p>${data.notes}</p>` : ''}
  </div>

  <div class="section">
    <div class="section-title">FINAL PAYCHECK:</div>
    <p>Your final paycheck will include:</p>
    <ul>
      <li>Salary through your last day of work</li>
      <li>Payment for any accrued but unused paid time off (PTO)</li>
      <li>Any other compensation owed per company policy and applicable law</li>
    </ul>
    <p>Final payment will be processed according to regular payroll schedule or as required by state law, whichever comes first.</p>
  </div>

  <div class="section">
    <div class="section-title">BENEFITS INFORMATION:</div>
    <p><strong>Health Insurance:</strong> Your health insurance coverage will continue through the end of the month in which your employment terminates. You will receive separate COBRA continuation coverage information from our benefits administrator.</p>
    <p><strong>401(k) Plan:</strong> You will receive information regarding your 401(k) account and rollover options from our plan administrator.</p>
    <p><strong>Other Benefits:</strong> All other company benefits will cease as of your termination date unless otherwise specified in plan documents.</p>
  </div>

  <div class="important-box">
    <div class="section-title">RETURN OF COMPANY PROPERTY:</div>
    <p>You are required to return all company property by your last day of work, including but not limited to:</p>
    <ul>
      <li>Laptop computer, tablet, and any other electronic devices</li>
      <li>Access badges, keys, and security credentials</li>
      <li>Company credit cards</li>
      <li>Any confidential or proprietary documents and materials</li>
      <li>Any other company-owned property in your possession</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">CONTINUING OBLIGATIONS:</div>
    <p>Please be reminded that your obligations under any confidentiality, non-compete, and non-solicitation agreements continue beyond the termination of your employment. You must continue to protect all confidential and proprietary information of ${COMPANY_INFO.name}.</p>
  </div>

  <div class="section">
    <div class="section-title">EXIT PROCESS:</div>
    <p>Human Resources will contact you to schedule an exit interview. During this meeting, we will:</p>
    <ul>
      <li>Collect all company property</li>
      <li>Provide information about final pay and benefits</li>
      <li>Discuss any questions you may have about the termination</li>
      <li>Complete necessary separation paperwork</li>
    </ul>
  </div>

  <p style="margin-top: 30px;">If you have any questions regarding this termination or the exit process, please contact Human Resources at ${COMPANY_INFO.email} or ${COMPANY_INFO.phone}.</p>

  <p>We wish you the best in your future endeavors.</p>

  <p>Sincerely,</p>

  <div class="signature-section">
    <div class="signature-line"></div>
    <p>HR Director<br>${COMPANY_INFO.name}</p>
  </div>

  <div class="signature-section">
    <p><strong>Employee Acknowledgment of Receipt:</strong></p>
    <div class="signature-line"></div>
    <p>${data.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ______________</p>
  </div>

  <p style="margin-top: 40px; font-size: 11px; color: #666;"><strong>CC:</strong> Personnel File, Payroll Department</p>
</body>
</html>
  `
}

export const generateEquityGrantTemplate = (data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    h1 { text-align: center; margin: 30px 0; }
    .grant-box { background-color: #f0f9ff; border: 2px solid #0284c7; padding: 20px; margin: 20px 0; }
    .section { margin: 25px 0; }
    .section-title { font-weight: bold; margin: 15px 0 10px 0; font-size: 16px; }
    .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table td { padding: 8px; border: 1px solid #ddd; }
    table td:first-child { font-weight: bold; background-color: #f5f5f5; width: 40%; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${COMPANY_INFO.name}</div>
    <h1>STOCK OPTION GRANT AGREEMENT</h1>
  </div>

  <p><strong>Grant Date:</strong> ${currentDate}</p>

  <p>This Stock Option Grant Agreement ("Agreement") is entered into between <strong>${COMPANY_INFO.name}</strong> ("Company") and <strong>${data.name}</strong> ("Optionholder").</p>

  <div class="grant-box">
    <h2 style="margin-top: 0; text-align: center;">GRANT DETAILS</h2>
    <table>
      <tr>
        <td>Optionholder Name:</td>
        <td>${data.name}</td>
      </tr>
      <tr>
        <td>Position:</td>
        <td>${data.role}</td>
      </tr>
      <tr>
        <td>Number of Shares:</td>
        <td><strong>${data.shares ? Number(data.shares).toLocaleString() : '[Number]'} shares</strong></td>
      </tr>
      <tr>
        <td>Exercise Price per Share:</td>
        <td>$[Fair Market Value as of Grant Date]</td>
      </tr>
      <tr>
        <td>Vesting Schedule:</td>
        <td>${data.vestingPeriod === '4year' ? '4 years with 1-year cliff (25% after year 1, then monthly)' :
            data.vestingPeriod === '3year' ? '3 years with monthly vesting' :
                data.vestingPeriod === '2year' ? '2 years with quarterly vesting' :
                    '[Vesting Schedule]'}</td>
      </tr>
      <tr>
        <td>Grant Date:</td>
        <td>${data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : currentDate}</td>
      </tr>
      <tr>
        <td>Expiration Date:</td>
        <td>10 years from Grant Date</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">1. GRANT OF OPTION</div>
    <p>Subject to the terms and conditions of this Agreement and the Company's Stock Option Plan, the Company hereby grants to the Optionholder the right and option to purchase up to <strong>${data.shares || '[Number]'}</strong> shares of the Company's Common Stock at an exercise price of $[Price] per share.</p>
  </div>

  <div class="section">
    <div class="section-title">2. VESTING SCHEDULE</div>
    <p>The Options shall vest according to the following schedule:</p>
    ${data.vestingPeriod === '4year' ? `
    <ul>
      <li><strong>Cliff Vesting:</strong> 25% of the Options shall vest on the first anniversary of the Grant Date</li>
      <li><strong>Monthly Vesting:</strong> The remaining 75% shall vest in equal monthly installments over the following 36 months</li>
      <li><strong>Continuous Service Required:</strong> Vesting is contingent upon continuous service with the Company</li>
    </ul>
    ` : `
    <ul>
      <li>Options vest according to the schedule specified in the Grant Details table above</li>
      <li>Vesting is contingent upon continuous employment with the Company</li>
      <li>Partially vested options may be exercised only to the extent vested</li>
    </ul>
    `}
  </div>

  <div class="section">
    <div class="section-title">3. EXERCISE OF OPTIONS</div>
    <p>Vested Options may be exercised in whole or in part at any time during the option term by providing written notice to the Company and payment of the exercise price. Payment may be made by:</p>
    <ul>
      <li>Cash or check</li>
      <li>Cashless exercise through a broker (if permitted)</li>
      <li>Net exercise (if permitted by the Plan)</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">4. TERMINATION OF EMPLOYMENT</div>
    <ul>
      <li><strong>Voluntary Resignation:</strong> Options must be exercised within 90 days of termination date, only to the extent vested</li>
      <li><strong>Termination for Cause:</strong> All options, vested and unvested, are immediately forfeited</li>
      <li><strong>Involuntary Termination without Cause:</strong> Options must be exercised within 90 days, only to the extent vested</li>
      <li><strong>Death or Disability:</strong> Options remain exercisable for 12 months, and vesting may accelerate per plan terms</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">5. RESTRICTIONS ON TRANSFER</div>
    <p>These Options are personal to the Optionholder and may not be sold, transferred, assigned, pledged, or otherwise encumbered, except by will or the laws of descent and distribution. During the Optionholder's lifetime, Options may be exercised only by the Optionholder.</p>
  </div>

  <div class="section">
    <div class="section-title">6. TAX CONSEQUENCES</div>
    <p>The Optionholder acknowledges that they are responsible for all tax consequences arising from the grant and exercise of these Options. The Company recommends consulting with a tax advisor regarding the tax treatment of this grant.</p>
  </div>

  <div class="section">
    <div class="section-title">7. CHANGE OF CONTROL</div>
    <p>In the event of a Change of Control (as defined in the Stock Option Plan), vesting may accelerate as determined by the Board of Directors or as specified in the Plan documents.</p>
  </div>

  <div class="section">
    <div class="section-title">8. GOVERNING DOCUMENTS</div>
    <p>This Agreement is subject to all terms and provisions of the Company's Stock Option Plan, which is incorporated herein by reference. In the event of any conflict between this Agreement and the Plan, the Plan shall control.</p>
  </div>

  ${data.notes ? `<div class="section"><div class="section-title">9. ADDITIONAL TERMS</div><p>${data.notes}</p></div>` : ''}

  <p style="margin-top: 40px;">By signing below, the Optionholder acknowledges receipt of this Agreement and the Stock Option Plan, and agrees to be bound by all terms and conditions contained therein.</p>

  <div class="signature-section">
    <div class="signature-block">
      <p><strong>COMPANY:</strong></p>
      <p>${COMPANY_INFO.name}</p>
      <div class="signature-line"></div>
      <p>Authorized Officer<br>Date: ______________</p>
    </div>
    
    <div class="signature-block">
      <p><strong>OPTIONHOLDER:</strong></p>
      <div class="signature-line"></div>
      <p>${data.name}<br>Date: ______________</p>
    </div>
  </div>

  <div style="margin-top: 40px; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
    <p style="margin: 0; font-size: 11px;"><strong>IMPORTANT NOTICE:</strong> This is a valuable document. Please retain it for your records. Stock options have significant tax implications. Consult with your financial and tax advisors before exercising options.</p>
  </div>
</body>
</html>
  `
}
