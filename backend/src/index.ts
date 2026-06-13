import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { getMapplsToken } from './lib/mapplsToken';

async function main() {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  app.get('/health', (_, res) => res.json({ status: 'ok' }));

  app.get('/api/mappls/token', async (_, res) => {
    try {
      const token = await getMapplsToken();
      res.json({ token });
    } catch (err) {
      console.error('Mappls token error:', err);
      res.status(500).json({ error: 'Failed to fetch Mappls token' });
    }
  });

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => console.log(`Backend running at http://localhost:${port}/graphql`));
}

main().catch(console.error);
