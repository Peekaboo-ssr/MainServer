import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import config from '@peekaboo-ssr/config/gateway';
import { getSocketByRemote } from '../sessions/sessions.js';
import { sendPacketToClient } from '../utils/response/client.response.js';

class S2GEventHandler extends BaseEvent {
  onConnection(socket) {
    console.log(
      `Service connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );
    socket.buffer = Buffer.alloc(0);
  }

  async onData(socket, data) {
    // 게이트에서 클라이언트한테 보내기.
    console.log('게이트가 서비스로부터 데이터를 받음..', data);
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (
      socket.buffer.length >=
      config.header.client.typeLength + config.header.client.clientKeyLength
    ) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.client.typeLength;
      console.log(packetType);

      const clientKeyLength = socket.buffer.readUInt8(offset);
      offset += config.header.client.clientKeyLength;
      console.log(clientKeyLength);

      const clientKey = socket.buffer
        .subarray(offset, offset + clientKeyLength)
        .toString();
      console.log(clientKey);
      offset += clientKeyLength;

      const totalHeaderLength =
        config.header.client.typeLength +
        config.header.client.clientKeyLength +
        clientKeyLength;

      if (socket.buffer.length < totalHeaderLength) {
        break;
      }

      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.client.payloadLength;
      console.log(payloadLength);
      const totalPacketLength = totalHeaderLength + payloadLength;

      if (socket.buffer.length < totalPacketLength) {
        break;
      }
      const payloadBuffer = socket.buffer.subarray(
        offset,
        offset + payloadLength,
      );
      offset += payloadLength;
      try {
        socket.buffer = socket.buffer.subarray(offset);
        // 여기서 클라이언트를 찾아서 보내는 작업 하면 될 것 같음.
        const client = getSocketByRemote(clientKey);

        if (!client) {
          throw new Error('클라이언트를 찾을 수 없음!!');
        }

        sendPacketToClient(packetType, client, payloadBuffer);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onEnd(socket) {
    console.log(
      'Disconnected Service: ',
      socket.remoteAddress,
      socket.remotePort,
    );
  }

  onError(socket, err) {
    console.log(
      'Disconnected Service: ',
      socket.remoteAddress,
      socket.remotePort,
    );
  }
}

export default S2GEventHandler;