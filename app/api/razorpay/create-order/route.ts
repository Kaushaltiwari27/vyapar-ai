import Razorpay from 'razorpay'

export async function POST(req: Request) {
  try {
    const { amount, plan, businessId } = await req.json()
    
    // Check if keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return Response.json({ error: 'Razorpay keys not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      notes: { plan, businessId }
    })
    
    return Response.json(order)
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
