import { create } from 'ipfs-http-client'

export const ipfs = create({
  host: 'gateway.pinata.cloud',
  port: 443,
  protocol: 'https',
  headers: {
    authorization: `Bearer ${process.env.PINATA_JWT}`
  }
})
