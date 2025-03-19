import { JSONRPCServer } from 'json-rpc-2.0';
import { send_code, verify_code, create_user } from '../controllers/sendMail';

const server = new JSONRPCServer();

server.addMethod('send_code', send_code);
server.addMethod('verify_code', verify_code);
server.addMethod('create_user', create_user);

export default server;
