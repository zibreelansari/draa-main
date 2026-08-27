import type { Request, Response, NextFunction } from 'express';
import { contactInquirySchema, newsletterSchema } from '@draa/shared';
import { createContactInquiry, subscribeNewsletter } from '@draa/database';

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = contactInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please check your contact form details.', details: parsed.error.flatten() });
      return;
    }

    const inquiry = await createContactInquiry(parsed.data);
    res.status(201).json({
      data: {
        id: inquiry._id,
        message: 'Thank you for reaching out to DRAA. Our team will get back to you shortly.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    await subscribeNewsletter(parsed.data.email, parsed.data.source);
    res.json({ data: { message: 'Successfully subscribed to DRAA updates and insights.' } });
  } catch (err) {
    next(err);
  }
}
