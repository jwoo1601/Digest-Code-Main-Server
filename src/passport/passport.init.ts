import AuthenticationInit from './authentication';
import OAuth2AuthorizationInit from './oauth2.authorization';
import ClientPasswordAuthenticationInit from './clientPassword';

export default function Initialize() {
    AuthenticationInit();
    OAuth2AuthorizationInit();
    ClientPasswordAuthenticationInit();
}
