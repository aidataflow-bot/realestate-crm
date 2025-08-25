import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'rodrigo@realtor.com' },
      update: {},
      create: {
        email: 'rodrigo@realtor.com',
        password: hashedPassword,
        firstName: 'Rodrigo',
        lastName: 'Martinez',
        role: 'admin'
      }
    })
    console.log('✅ Created admin user:', admin.email)

    // Create sample clients
    const clients = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0123',
        role: 'BUYER',
        stage: 'SHOWING',
        city: 'Orlando',
        state: 'FL',
        tags: ['First Time Buyer', 'Referral'],
        notes: 'Looking for a family home with good schools nearby. Budget up to $450k.'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0124',
        role: 'SELLER',
        stage: 'ACTIVE',
        city: 'Tampa',
        state: 'FL',
        tags: ['Luxury', 'Repeat Client'],
        notes: 'Selling luxury condo to downsize. Very motivated seller.'
      },
      {
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'michael.davis@email.com',
        phone: '555-0125',
        role: 'BUYER',
        stage: 'CLOSED',
        city: 'Miami',
        state: 'FL',
        tags: ['Investor', 'Cash Buyer'],
        notes: 'Real estate investor looking for rental properties.'
      },
      {
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@email.com',
        phone: '555-0126',
        role: 'BUYER',
        stage: 'NEW',
        city: 'Jacksonville',
        state: 'FL',
        tags: ['First Time Buyer'],
        notes: 'Young professional, first time buyer. Needs education on the process.'
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '555-0127',
        role: 'SELLER',
        stage: 'NURTURE',
        city: 'St. Petersburg',
        state: 'FL',
        tags: ['Relocation'],
        notes: 'Job transfer to another state. Needs to sell quickly.'
      }
    ]

    for (const clientData of clients) {
      const client = await prisma.client.upsert({
        where: { email: clientData.email },
        update: clientData,
        create: clientData
      })
      console.log('✅ Created client:', `${client.firstName} ${client.lastName}`)

      // Add sample transactions for closed clients
      if (client.stage === 'CLOSED' || client.stage === 'ACTIVE') {
        const transactionData = {
          clientId: client.id,
          type: client.role === 'BUYER' ? 'BUY' : 'SELL',
          propertyAddress: client.firstName === 'Michael' 
            ? '1234 Investment Ave' 
            : client.firstName === 'Sarah' 
            ? '5678 Luxury Lane' 
            : '9012 Sample Street',
          city: client.city!,
          state: client.state!,
          status: client.stage === 'CLOSED' ? 'CLOSED' : 'ACTIVE',
          price: client.firstName === 'Michael' 
            ? 380000.00 
            : client.firstName === 'Sarah' 
            ? 550000.00 
            : 425000.00,
          commissionRatePct: 3.0,
          mySplitPct: 80.0,
          closeDate: client.stage === 'CLOSED' ? new Date('2024-07-15') : null
        }

        // Calculate commissions
        const grossCommission = (transactionData.price * transactionData.commissionRatePct) / 100
        const netCommission = (grossCommission * transactionData.mySplitPct) / 100
        
        transactionData.grossCommission = grossCommission
        transactionData.netCommissionToMe = netCommission

        const transaction = await prisma.transaction.upsert({
          where: { 
            id: `${client.id}-transaction-1` 
          },
          update: transactionData,
          create: {
            id: `${client.id}-transaction-1`,
            ...transactionData
          }
        })
        console.log('✅ Created transaction for:', client.firstName, '-', transactionData.propertyAddress)
      }
    }

    console.log('🎉 Seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })