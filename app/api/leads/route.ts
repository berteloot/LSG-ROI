import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      email,
      state,
      baseMonthlySalary,
      fteCount,
      selectedRoleCategory,
      inclusions,
      calculatedSavings,
      calculatedCosts
    } = body;

    // Get role category name from database using the ID
    let roleCategoryName = "Business Operations"; // Default fallback
    try {
      const category = await prisma.role_categories.findUnique({
        where: { category_id: parseInt(selectedRoleCategory) },
        select: { category_name: true }
      });
      if (category) {
        roleCategoryName = category.category_name;
      }
    } catch (error) {
      console.error("Failed to fetch role category name:", error);
    }

    // Create cost breakdown for database storage
    const costBreakdown = Object.entries(inclusions).reduce((acc, [key, included]) => {
      const displayNames: Record<string, string> = {
        payrollTaxes: "Payroll Taxes",
        customaryBenefits: "Customary Benefits", 
        administrativeOverhead: "Administrative Overhead",
        itInfrastructure: "IT Infrastructure & Equipment",
        realEstate: "Real Estate & Facilities",
        workforceManagement: "Workforce Management"
      };
      acc[key] = {
        name: displayNames[key] || key, 
        included,
        displayName: displayNames[key] || key
      };
      return acc;
    }, {} as Record<string, any>);

    // Validate required fields
    if (!companyName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Company name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create lead record in the database
    const lead = await prisma.lSGCalculatorLead.create({
      data: {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.trim(),
        companyName: companyName.trim(),
        state,
        baseSalary: baseMonthlySalary,
        fteCount,
        roleCategoryKey: parseInt(selectedRoleCategory), // Convert string to integer
        totalEmployerLoad: calculatedSavings || 0,
        employerExtras: calculatedCosts || 0,
        inHouseTotalCost: calculatedCosts || 0,
        lsgCost: (baseMonthlySalary * 0.6 * fteCount) || 0,
        annualSavingsPercentage: calculatedSavings || 0,
        inclusions: inclusions, // Store the cost inclusions as JSON
        roleCategoryName: roleCategoryName, // Store the readable role name
        costBreakdown: costBreakdown, // Store the detailed cost breakdown for email
        createdAt: new Date()
      }
    });

    // Send email using SendGrid
    let emailSent = false;
    let emailSentAt = null;
    
    try {
      console.log("Attempting to send email to:", email.trim());
      await sendCalculationEmail({
        to: email.trim(),
        companyName: companyName.trim(),
        state,
        baseMonthlySalary,
        fteCount,
        selectedRoleCategory,
        inclusions,
        calculatedSavings,
        calculatedCosts
      });
      
      // Update lead record to mark email as sent
      emailSent = true;
      emailSentAt = new Date();
      
      await prisma.lSGCalculatorLead.update({
        where: { id: lead.id },
        data: {
          emailSent: true,
          emailSentAt: new Date()
        }
      });
      
      console.log("Email sent successfully to:", email.trim());
      
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the lead submission if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully",
      leadId: lead.id
    });

  } catch (error: any) {
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { 
        error: "Failed to submit lead",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function sendCalculationEmail(data: {
  to: string;
  companyName: string;
  state: string;
  baseMonthlySalary: number;
  fteCount: number;
  selectedRoleCategory: number;
  inclusions: Record<string, boolean>;
  calculatedSavings: number;
  calculatedCosts: number;
}) {
  const {
    to,
    companyName,
    state,
    baseMonthlySalary,
    fteCount,
    selectedRoleCategory,
    inclusions,
    calculatedSavings,
    calculatedCosts
  } = data;

  // Get role category name from database
  let selectedRole = "Business Operations"; // Default fallback
  try {
    const category = await prisma.role_categories.findUnique({
      where: { category_id: parseInt(selectedRoleCategory.toString()) },
      select: { category_name: true }
    });
    if (category) {
      selectedRole = category.category_name;
    }
  } catch (error) {
    console.error("Failed to fetch role category name for email:", error);
  }

  const costBreakdown = Object.entries(inclusions).map(([key, included]) => {
    const displayNames: Record<string, string> = {
      payrollTaxes: "Payroll Taxes",
      customaryBenefits: "Customary Benefits", 
      administrativeOverhead: "Administrative Overhead",
      itInfrastructure: "IT Infrastructure & Equipment",
      realEstate: "Real Estate & Facilities",
      workforceManagement: "Workforce Management"
    };
    return { name: displayNames[key] || key, included };
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your LSG Cost Analysis Results</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .savings-highlight { background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px; }
        .savings-percentage { font-size: 48px; font-weight: bold; color: #155724; margin: 0; }
        .savings-label { font-size: 18px; color: #155724; margin: 10px 0 0 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; margin: 30px 0 20px 0; }
        .cost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .cost-item { padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; }
        .cost-included { background-color: #d4edda; border: 1px solid #c3e6cb; }
        .cost-excluded { background-color: #f8d7da; border: 1px solid #f5c6cb; }
        .checkmark { color: #28a745; font-weight: bold; }
        .x-mark { color: #dc3545; font-weight: bold; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .detail-item { background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .detail-label { font-size: 14px; color: #6c757d; margin-bottom: 5px; }
        .detail-value { font-size: 18px; font-weight: bold; color: #2c3e50; }
        .cta-section { background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background-color: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; border-top: 1px solid #e9ecef; }
        .footer p { margin: 5px 0; }
        @media (max-width: 600px) {
          .cost-grid, .details-grid { grid-template-columns: 1fr; }
          .header, .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your LSG Cost Analysis Results</h1>
        </div>
        
        <div class="content">
          <p>Dear ${companyName} Team,</p>
          
          <p>Thank you for using our LSG vs In-House Cost Calculator. We've analyzed your business operations and prepared a detailed cost comparison.</p>
          
          <div class="savings-highlight">
            <div class="savings-percentage">${calculatedSavings.toFixed(1)}%</div>
            <div class="savings-label">Estimated Savings for 12-Month Period</div>
          </div>
          
          <div class="section-title">Your Business Profile</div>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">State</div>
              <div class="detail-value">${state}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Role Category</div>
              <div class="detail-value">${selectedRole}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Monthly Salary per FTE</div>
              <div class="detail-value">$${baseMonthlySalary.toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Number of FTEs</div>
              <div class="detail-value">${fteCount}</div>
            </div>
          </div>
          
          <div class="section-title">Cost Categories Included in Your Calculation</div>
          <div class="cost-grid">
            <div class="cost-item cost-included">
              <span class="checkmark">✓</span>
              <span>Payroll Taxes</span>
            </div>
            <div class="cost-item cost-included">
              <span class="checkmark">✓</span>
              <span>Employee Benefits</span>
            </div>
            <div class="cost-item cost-included">
              <span class="checkmark">✓</span>
              <span>Administrative Overhead</span>
            </div>
            <div class="cost-item cost-included">
              <span class="checkmark">✓</span>
              <span>IT Infrastructure & Equipment</span>
            </div>
            <div class="cost-item cost-included">
              <span class="checkmark">✓</span>
              <span>Workforce Management</span>
            </div>
          </div>
          
          <p>This comparison shows the potential cost advantages of working with Lean Solutions Group versus keeping these roles in-house.</p>
          
          <div class="cta-section">
            <p>If you'd like to review these results in more detail and discuss how they apply to your business, we'd be happy to set up a short call.</p>
            <a href="https://www.leangroup.com/contact" class="cta-button" target="_blank" rel="noopener noreferrer">Schedule a Call</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Best regards,</strong></p>
          <p>The Lean Solutions Group Team</p>
          <p>Email: stan@berteloot.org</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Your LSG Cost Analysis Results

Dear ${companyName} Team,

Thank you for using our LSG vs In-House Cost Calculator. We've analyzed your business operations and prepared a detailed cost comparison.

Estimated Savings: ${calculatedSavings.toFixed(1)}% for 12-Month Period

Your Business Profile:
- State: ${state}
- Role Category: ${selectedRole}
- Monthly Salary per FTE: $${baseMonthlySalary.toLocaleString()}
- Number of FTEs: ${fteCount}

Cost Categories Included in Your Calculation:
- Payroll Taxes: Included
- Employee Benefits: Included
- Administrative Overhead: Included
- IT Infrastructure & Equipment: Included
- Workforce Management: Included

This comparison shows the potential cost advantages of working with Lean Solutions Group versus keeping these roles in-house.

If you'd like to review these results in more detail and discuss how they apply to your business, we'd be happy to set up a short call.

Contact us: https://www.leangroup.com/contact

Best regards,
The Lean Solutions Group Team
Email: stan@berteloot.org
  `;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to, name: companyName }],
          subject: `Your LSG Cost Analysis: ${calculatedSavings.toFixed(1)}% Potential Savings`
        }
      ],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'stan@berteloot.org',
        name: process.env.SENDGRID_FROM_NAME || 'Lean Solutions Group'
      },
      content: [
        {
          type: 'text/plain',
          value: emailText
        },
        {
          type: 'text/html',
          value: emailHtml
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }
}
