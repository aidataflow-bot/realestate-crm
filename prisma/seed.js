const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'rodrigo@realtor.com' },
    update: {},
    create: {
      email: 'rodrigo@realtor.com',
      firstName: 'Rodrigo',
      lastName: 'Garcia',
      password: hashedPassword,
      role: 'agent'
    }
  })

  console.log('👤 Created admin user:', adminUser.email)

  // Create sample clients with comprehensive data
  const sampleClients = [
    {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      email: 'maria.rodriguez@email.com',
      phone: '(305) 555-0123',
      address: '1234 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      birthday: new Date('1985-06-15'),
      anniversary: new Date('2010-09-20'),
      occupation: 'Marketing Manager',
      spouse: 'Carlos Rodriguez',
      children: 'Sofia (8), Diego (5)',
      notes: 'Looking for a family home with good schools nearby. Budget around $650K. Very responsive and motivated buyer.',
      preferredContact: 'email',
      leadSource: 'Zillow',
      referredBy: 'John Smith',
      tags: ['First-time Buyer', 'Family', 'Qualified', 'VIP'],
      agentId: adminUser.id
    },
    {
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@techcorp.com',
      phone: '(415) 555-0198',
      address: '567 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      birthday: new Date('1990-11-03'),
      occupation: 'Senior Software Engineer',
      notes: 'Tech executive looking for luxury condo in SOMA. Cash buyer, budget $2M+. Very decisive and quick to close.',
      preferredContact: 'phone',
      leadSource: 'Website',
      tags: ['Luxury', 'Cash Buyer', 'Tech', 'High Net Worth'],
      agentId: adminUser.id
    },
    {
      firstName: 'Jennifer',
      lastName: 'Williams',
      email: 'jen.williams@gmail.com',
      phone: '(972) 555-0167',
      address: '890 Highland Park',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75205',
      birthday: new Date('1978-03-22'),
      anniversary: new Date('2005-07-14'),
      occupation: 'Real Estate Investor',
      spouse: 'Michael Williams',
      children: 'Emma (12), Jack (10), Lily (7)',
      notes: 'Experienced investor looking for rental properties. Prefers properties under $400K with good rental yields.',
      preferredContact: 'text',
      leadSource: 'Referral',
      referredBy: 'Sarah Johnson',
      tags: ['Investor', 'Repeat Client', 'Rental Properties', 'Portfolio'],
      agentId: adminUser.id
    },
    {
      firstName: 'Robert',
      lastName: 'Kim',
      email: 'robert.kim@finance.com',
      phone: '(212) 555-0189',
      address: '432 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10016',
      birthday: new Date('1982-09-12'),
      anniversary: new Date('2015-05-30'),
      occupation: 'Investment Banker',
      spouse: 'Lisa Kim',
      children: 'Alex (6), Grace (4)',
      notes: 'Looking to upgrade to a larger apartment in Manhattan. Budget $3-5M range.',
      preferredContact: 'email',
      leadSource: 'Cold Call',
      tags: ['Luxury', 'Manhattan', 'Finance', 'Upgrade'],
      agentId: adminUser.id
    },
    {
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah.thompson@design.com',
      phone: '(503) 555-0145',
      address: '789 Pearl District',
      city: 'Portland',
      state: 'OR',
      zipCode: '97209',
      birthday: new Date('1987-12-08'),
      occupation: 'Interior Designer',
      notes: 'First-time buyer looking for a modern condo or loft. Interested in properties with character and good design.',
      preferredContact: 'phone',
      leadSource: 'Instagram',
      tags: ['First-time Buyer', 'Design Professional', 'Modern', 'Millennial'],
      agentId: adminUser.id
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'mike.johnson@retire.com',
      phone: '(480) 555-0176',
      address: '567 Desert Vista',
      city: 'Scottsdale',
      state: 'AZ',
      zipCode: '85251',
      birthday: new Date('1965-04-18'),
      anniversary: new Date('1990-06-22'),
      occupation: 'Retired Executive',
      spouse: 'Patricia Johnson',
      notes: 'Recently retired couple looking to downsize to a smaller home with low maintenance. Golf course community preferred.',
      preferredContact: 'phone',
      leadSource: 'Referral',
      referredBy: 'Tom Davis',
      tags: ['Downsizing', 'Retiree', 'Golf Community', 'Low Maintenance'],
      agentId: adminUser.id
    }
  ]

  const createdClients = []
  for (const clientData of sampleClients) {
    const client = await prisma.client.create({
      data: clientData
    })
    createdClients.push(client)
    console.log(`👥 Created client: ${client.firstName} ${client.lastName}`)
  }

  // Create comprehensive transaction history
  const sampleTransactions = [
    {
      clientId: createdClients[0].id, // Maria Rodriguez
      agentId: adminUser.id,
      type: 'buy',
      status: 'closed',
      propertyAddress: '1456 Coral Way, Miami, FL 33145',
      salePrice: 625000,
      listPrice: 649000,
      commissionRate: 3.0,
      grossCommission: 18750,
      netCommission: 13125,
      splitPercentage: 70.0,
      brokerageFee: 500,
      closeDate: new Date('2024-01-15'),
      listDate: new Date('2023-11-20'),
      contractDate: new Date('2023-12-18'),
      notes: 'Great first-time buyers. Smooth transaction with quick closing. Family loved the neighborhood schools.'
    },
    {
      clientId: createdClients[1].id, // David Chen
      agentId: adminUser.id,
      type: 'sell',
      status: 'pending',
      propertyAddress: '789 Mission Street, San Francisco, CA 94103',
      salePrice: 1850000,
      listPrice: 1899000,
      commissionRate: 2.5,
      grossCommission: 46250,
      netCommission: 32375,
      splitPercentage: 70.0,
      brokerageFee: 750,
      listDate: new Date('2024-06-01'),
      contractDate: new Date('2024-07-15'),
      notes: 'Luxury condo with city views. Multiple offers received above asking price.'
    },
    {
      clientId: createdClients[2].id, // Jennifer Williams
      agentId: adminUser.id,
      type: 'buy',
      status: 'closed',
      propertyAddress: '2234 Elm Street, Dallas, TX 75226',
      salePrice: 385000,
      listPrice: 399000,
      commissionRate: 2.75,
      grossCommission: 10587.50,
      netCommission: 7411.25,
      splitPercentage: 70.0,
      brokerageFee: 300,
      closeDate: new Date('2024-03-10'),
      listDate: new Date('2024-01-05'),
      contractDate: new Date('2024-02-20'),
      notes: 'Investment property with great rental potential. Cash purchase, quick close.'
    },
    {
      clientId: createdClients[2].id, // Jennifer Williams (2nd transaction)
      agentId: adminUser.id,
      type: 'buy',
      status: 'closed',
      propertyAddress: '5678 Oak Lane, Dallas, TX 75230',
      salePrice: 420000,
      listPrice: 425000,
      commissionRate: 2.75,
      grossCommission: 11550,
      netCommission: 8085,
      splitPercentage: 70.0,
      brokerageFee: 300,
      closeDate: new Date('2024-05-22'),
      listDate: new Date('2024-04-10'),
      contractDate: new Date('2024-05-05'),
      notes: 'Second investment property for Jennifer. Another great rental opportunity in desirable area.'
    },
    {
      clientId: createdClients[3].id, // Robert Kim
      agentId: adminUser.id,
      type: 'buy',
      status: 'pending',
      propertyAddress: '150 Central Park West, New York, NY 10023',
      salePrice: 4200000,
      listPrice: 4350000,
      commissionRate: 2.0,
      grossCommission: 84000,
      netCommission: 58800,
      splitPercentage: 70.0,
      brokerageFee: 1000,
      listDate: new Date('2024-07-01'),
      contractDate: new Date('2024-08-15'),
      notes: 'Luxury pre-war co-op with Central Park views. Due diligence in progress.'
    }
  ]

  for (const transactionData of sampleTransactions) {
    const transaction = await prisma.transaction.create({
      data: transactionData
    })
    console.log(`💰 Created transaction: ${transaction.propertyAddress}`)
  }

  // Create sample properties
  const sampleProperties = [
    {
      clientId: createdClients[0].id,
      address: '1456 Coral Way',
      city: 'Miami',
      state: 'FL',
      zipCode: '33145',
      price: 625000,
      type: 'Single Family',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1850,
      yearBuilt: 1995,
      mls: 'A11234567',
      description: 'Beautiful single-family home with updated kitchen, pool, and mature landscaping',
      features: ['Pool', 'Updated Kitchen', 'Hardwood Floors', 'Two-Car Garage'],
      status: 'sold'
    },
    {
      clientId: createdClients[1].id,
      address: '789 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      price: 1850000,
      type: 'Condo',
      bedrooms: 2,
      bathrooms: 2.5,
      sqft: 1200,
      yearBuilt: 2018,
      mls: 'SF7654321',
      description: 'Modern luxury condo with panoramic city views and premium finishes',
      features: ['City Views', 'Luxury Finishes', 'Concierge', 'Gym', 'Roof Deck'],
      status: 'pending'
    },
    {
      clientId: createdClients[2].id,
      address: '2234 Elm Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75226',
      price: 385000,
      type: 'Single Family',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1600,
      yearBuilt: 2005,
      mls: 'DFW98765',
      description: 'Great investment property in up-and-coming neighborhood',
      features: ['Open Floor Plan', 'Updated Appliances', 'Large Backyard'],
      status: 'sold'
    }
  ]

  for (const propertyData of sampleProperties) {
    const property = await prisma.property.create({
      data: propertyData
    })
    console.log(`🏠 Created property: ${property.address}`)
  }

  // Create sample calls, emails, and activities
  for (const [index, client] of createdClients.entries()) {
    // Create activities
    await prisma.activity.create({
      data: {
        clientId: client.id,
        type: 'client_added',
        title: 'Client Added',
        description: `${client.firstName} ${client.lastName} was added to the CRM`
      }
    })

    await prisma.activity.create({
      data: {
        clientId: client.id,
        type: 'initial_contact',
        title: 'Initial Consultation',
        description: `First meeting completed with ${client.firstName} ${client.lastName} to discuss their real estate needs`
      }
    })

    // Create sample calls
    await prisma.call.create({
      data: {
        clientId: client.id,
        phoneNumber: client.phone || '(555) 000-0000',
        duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
        notes: `Discussed current market conditions and ${client.firstName}'s timeline for buying/selling`,
        outcome: 'answered'
      }
    })

    // Create sample todos
    await prisma.todo.create({
      data: {
        clientId: client.id,
        title: 'Send market analysis report',
        description: `Prepare and send CMA for ${client.firstName} ${client.lastName}`,
        priority: 'high',
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        completed: Math.random() > 0.5
      }
    })

    // Create sample emails
    await prisma.email.create({
      data: {
        clientId: client.id,
        agentId: adminUser.id,
        subject: `Welcome to the family, ${client.firstName}!`,
        body: `Dear ${client.firstName},\n\nWelcome to our real estate family! I'm excited to help you with your real estate journey.\n\nBest regards,\nRodrigo Garcia`,
        to: [client.email || 'client@example.com'],
        cc: [],
        bcc: [],
        status: 'sent',
        sentAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }
    })

    // Create reminders
    if (client.birthday) {
      const nextBirthday = new Date(client.birthday)
      nextBirthday.setFullYear(new Date().getFullYear())
      if (nextBirthday < new Date()) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
      }

      await prisma.reminder.create({
        data: {
          clientId: client.id,
          agentId: adminUser.id,
          title: `${client.firstName}'s Birthday`,
          description: `Send birthday wishes to ${client.firstName} ${client.lastName}`,
          reminderDate: nextBirthday,
          type: 'birthday',
          recurring: true
        }
      })
    }
  }

  // Create some upcoming reminders
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  await prisma.reminder.create({
    data: {
      clientId: createdClients[0].id,
      agentId: adminUser.id,
      title: 'Follow up on home warranty',
      description: 'Check if Maria needs help with home warranty setup',
      reminderDate: nextWeek,
      type: 'follow_up'
    }
  })

  await prisma.reminder.create({
    data: {
      clientId: createdClients[1].id,
      agentId: adminUser.id,
      title: 'Property inspection reminder',
      description: 'Remind David about upcoming property inspection',
      reminderDate: nextMonth,
      type: 'closing'
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - Clients: ${createdClients.length}`)
  console.log(`   - Transactions: ${sampleTransactions.length}`)
  console.log(`   - Properties: ${sampleProperties.length}`)
  console.log(`   - Login with: rodrigo@realtor.com / admin123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })