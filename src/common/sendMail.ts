import sgMail from '@sendgrid/mail';
sgMail.setApiKey('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');

export default async function ({
    to,
    from = 'prashantchetry98@gmail.com',
    subject,
    html,
}: {
    to: string;
    from?: string;
    subject: string;
    html: string;
}): Promise<boolean> {
    const msg = {
        to,
        from,
        subject,
        text: 'and easy to do anywhere, even with Node.js',
        html,
    };
    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        return false;
    }
}
