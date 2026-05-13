interface Env {
  WEB3FORMS_ACCESS_KEY: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const formData = await context.request.formData();
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const message = formData.get('message')?.toString() || '';

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const sanitizedName = name.replace(/<[^>]*>/g, '').slice(0, 100);
    const sanitizedMessage = message.replace(/<[^>]*>/g, '').slice(0, 2000);

    const web3formsData = new FormData();
    web3formsData.append('access_key', context.env.WEB3FORMS_ACCESS_KEY);
    web3formsData.append('name', sanitizedName);
    web3formsData.append('email', email);
    web3formsData.append('message', sanitizedMessage);
    web3formsData.append('subject', 'New PeakMind Inquiry');

    const result = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: web3formsData,
    }).then(r => r.json());

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Failed to send message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}