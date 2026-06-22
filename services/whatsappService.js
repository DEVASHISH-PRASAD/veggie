const whatsappService = {
  sendAlert: async (phone, contentText) => {
    try {
      console.log(`[WHATSAPP OVERLAY] SMS to ${phone}: "${contentText}"`);
      return true;
    } catch (err) {
      console.error(
        `WhatsApp communication link processing exception: ${err.message}`,
      );
      return false;
    }
  },
};

export default whatsappService;
