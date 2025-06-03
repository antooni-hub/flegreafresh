// Configurazione
const TELEGRAM_BOT_TOKEN = '8082633997:AAE8qjz1sEETjQbF3xtF9e7jl_qMv-pyD9w';
const TELEGRAM_CHAT_ID = '645276435';

exports.handler = async (event, context) => {
  // Gestisce solo richieste POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Estrae i dati dell'ordine
    const orderData = JSON.parse(event.body);
    
    // Formatta il messaggio per Telegram
    const message = formatOrderMessage(orderData);
    
    // Invia a Telegram
    const telegramResponse = await sendToTelegram(message);
    const telegramJson = await telegramResponse.json();


    if (telegramJson.ok) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Ordine ricevuto e inviato!' 
        })
      };
    } else {
      throw new Error('Errore invio Telegram');
    }
    
  } catch (error) {
    console.error('Errore:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: 'Errore interno del server' 
      })
    };
  }
};

// Funzione per formattare il messaggio
function formatOrderMessage(order) {
  let message = `🛒 **NUOVO ORDINE FLEGRAFRESH**\n\n`;
  
  // Dati cliente
  message += `👤 **Cliente:**\n`;
  message += `• Nome: ${order.cliente.nome}\n`;
  message += `• Telefono: ${order.cliente.telefono}\n`;
  if (order.cliente.email) {
    message += `• Email: ${order.cliente.email}\n`;
  }
  
  // Indirizzo
  message += `\n📍 **Consegna:**\n`;
  message += `• ${order.indirizzo.via} ${order.indirizzo.civico}\n`;
  message += `• ${order.indirizzo.citta}\n`;
  if (order.indirizzo.note) {
    message += `• Note: ${order.indirizzo.note}\n`;
  }
  
  // Prodotti ordinati
  message += `\n🛍️ **Prodotti:**\n`;
  let hasProdotti = false;
  
  for (const [prodotto, quantita] of Object.entries(order.prodotti)) {
    if (quantita > 0) {
      message += `• ${prodotto}: ${quantita}\n`;
      hasProdotti = true;
    }
  }
  
  if (order.altriProdotti) {
    message += `• Altri: ${order.altriProdotti}\n`;
    hasProdotti = true;
  }
  
  if (!hasProdotti) {
    message += `• Nessun prodotto specifico selezionato\n`;
  }
  
  // Preferenze spesa
  message += `\n🏪 **Tipo Spesa:** ${order.tipoSpesa}\n`;
  if (order.negoziPreferiti) {
    message += `• Negozi preferiti: ${order.negoziPreferiti}\n`;
  }
  
  // Orario e pagamento
  message += `\n⏰ **Consegna:** ${order.orario}\n`;
  message += `💳 **Pagamento:** ${order.pagamento}\n`;
  
  // Timestamp
  const data = new Date(order.timestamp);
  message += `\n📅 **Ordinato:** ${data.toLocaleString('it-IT')}\n`;
  
  return message;
}

// Funzione per inviare a Telegram
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    })
  });
  
  return response;
}
