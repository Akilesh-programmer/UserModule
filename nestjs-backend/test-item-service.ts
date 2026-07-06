import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

async function run() {
  console.log('Connecting to Item Service on localhost:3004...');
  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3004,
    },
  });

  try {
    console.log('Sending category.findActive...');
    const result = await firstValueFrom(client.send('category.findActive', {}));
    console.log('Result from category.findActive:', result);
  } catch (err) {
    console.error('Error from category.findActive:', err);
  }

  try {
    console.log('Sending category.findAll...');
    const result = await firstValueFrom(client.send('category.findAll', {}));
    console.log('Result from category.findAll:', result);
  } catch (err) {
    console.error('Error from category.findAll:', err);
  }

  // Close TCP connections
  client.close();
}

run().catch(console.error);
