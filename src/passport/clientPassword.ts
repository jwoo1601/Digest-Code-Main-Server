import passport from 'passport';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Client } from '../models/client';

export default function ClientPasswordAuthentication() {
    passport.use(
        new ClientPasswordStrategy(async (clientId, clientSecret, done) => {
            try {
                const foundClient = await Client.findById(clientId);
                if (foundClient && foundClient.secret == clientSecret) {
                    done(null, foundClient);
                } else {
                    done(null, false);
                }
            } catch (err) {
                done(err);
            }
        }),
    );
}
