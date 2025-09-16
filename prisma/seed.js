const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample role categories
  const categories = await prisma.role_categories.createMany({
    data: [
      {
        category_name: 'Software Development',
        description: 'Full-stack development, mobile apps, web applications',
        monthly_cost: 8000
      },
      {
        category_name: 'Data Analysis',
        description: 'Business intelligence, data science, analytics',
        monthly_cost: 7000
      },
      {
        category_name: 'Customer Support',
        description: 'Technical support, customer service, help desk',
        monthly_cost: 4500
      },
      {
        category_name: 'Marketing',
        description: 'Digital marketing, content creation, social media',
        monthly_cost: 6000
      },
      {
        category_name: 'Sales',
        description: 'Business development, account management, lead generation',
        monthly_cost: 6500
      }
    ]
  });

  // Create sample employer cost data for Arizona
  const costData = await prisma.employerCostData.createMany({
    data: [
      {
        id: 'az-payroll-taxes',
        state: 'Arizona',
        category: 'payrollTaxes',
        item: 'Federal Income Tax',
        ratePercent: 6.2,
        employerCostUSD: 310,
        source: 'IRS',
        notes: 'Social Security tax'
      },
      {
        id: 'az-medicare',
        state: 'Arizona',
        category: 'payrollTaxes',
        item: 'Medicare Tax',
        ratePercent: 1.45,
        employerCostUSD: 72.5,
        source: 'IRS',
        notes: 'Medicare tax'
      },
      {
        id: 'az-futa',
        state: 'Arizona',
        category: 'payrollTaxes',
        item: 'Federal Unemployment Tax',
        ratePercent: 0.6,
        employerCostUSD: 30,
        source: 'IRS',
        notes: 'FUTA tax'
      },
      {
        id: 'az-sui',
        state: 'Arizona',
        category: 'payrollTaxes',
        item: 'State Unemployment Insurance',
        ratePercent: 2.0,
        employerCostUSD: 100,
        source: 'Arizona DES',
        notes: 'SUI tax'
      },
      {
        id: 'az-healthcare',
        state: 'Arizona',
        category: 'customaryBenefits',
        item: 'Health Insurance',
        ratePercent: 15.0,
        employerCostUSD: 750,
        source: 'Kaiser Family Foundation',
        notes: 'Average employer contribution'
      },
      {
        id: 'az-retirement',
        state: 'Arizona',
        category: 'customaryBenefits',
        item: '401(k) Match',
        ratePercent: 3.0,
        employerCostUSD: 150,
        source: 'Bureau of Labor Statistics',
        notes: 'Typical 3% match'
      },
      {
        id: 'az-pto',
        state: 'Arizona',
        category: 'customaryBenefits',
        item: 'Paid Time Off',
        ratePercent: 8.0,
        employerCostUSD: 400,
        source: 'Bureau of Labor Statistics',
        notes: 'Vacation and sick leave'
      },
      {
        id: 'az-admin',
        state: 'Arizona',
        category: 'administrativeOverhead',
        item: 'HR Administration',
        ratePercent: 2.0,
        employerCostUSD: 100,
        source: 'Industry Average',
        notes: 'HR processing costs'
      },
      {
        id: 'az-it',
        state: 'Arizona',
        category: 'itInfrastructure',
        item: 'IT Equipment & Software',
        ratePercent: 3.0,
        employerCostUSD: 150,
        source: 'Industry Average',
        notes: 'Laptops, software licenses, etc.'
      },
      {
        id: 'az-workforce',
        state: 'Arizona',
        category: 'workforceManagement',
        item: 'Recruitment & Training',
        ratePercent: 1.5,
        employerCostUSD: 75,
        source: 'Industry Average',
        notes: 'Hiring and onboarding costs'
      }
    ]
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${categories.count} role categories`);
  console.log(`Created ${costData.count} cost data entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
