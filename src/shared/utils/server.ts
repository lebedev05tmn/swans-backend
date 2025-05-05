import { JSONRPCServer } from 'json-rpc-2.0';
import { send_code, verify_code, create_user } from '../../core-auth/controllers/sendMail';
import { start_dating } from '../../core-anket/controllers/startDating/startDating';
import { get_next_pack } from '../../core-anket/controllers/getNextPack/getNextPack';

const server = new JSONRPCServer();

// Блок для работы с авторизацией через JSON-RPC
server.addMethod('send_code', send_code);
server.addMethod('verify_code', verify_code);
server.addMethod('create_user', create_user);

// Блок для работы с авторизацией через JSON-RPC
server.addMethod('start_dating', start_dating);
server.addMethod('get_next_pack', get_next_pack);

export default server;
