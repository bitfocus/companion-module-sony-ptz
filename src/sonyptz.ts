import * as dgram from 'dgram'
import { RequestOptions, request } from 'urllib'

export interface PtzCommand {
	path: string
	params: PtzCommandParams
}

export interface PtzCommandParams {
	[key: string]: string | number | boolean
}

export class PtzError extends Error {
	statusCode: number

	constructor(...args: any[]) {
		super(...args)
		this.name = 'PtzError'
		this.statusCode = -1
	}
}

export class SonyPTZ {
	private refererHeader: string

	constructor(
		private host: string,
		private port: number,
		private user: string,
		private pass: string,
		private referer: boolean,
	) {
		this.refererHeader = `http://${host}:${port}/`
	}

	async sendInq(params: PtzCommandParams): Promise<URLSearchParams> {
		return this.send({ path: 'command/inquiry.cgi', params })
	}

	async send(command: PtzCommand): Promise<URLSearchParams> {
		const url = `http://${this.host}:${this.port}/${command.path}`
		const options: RequestOptions = {
			method: 'GET',
			digestAuth: `${this.user}:${this.pass}`,
			data: command.params,
		}
		if (this.referer) {
			options.headers = { referer: this.refererHeader }
		}

		const { data, res } = await request(url, options)
		if (res.statusCode >= 200 && res.statusCode < 300 && data) {
			return new URLSearchParams(data.toString())
		}

		const err = new PtzError(`Command failed: ${command.path} with status ${res.statusCode}`)
		err.statusCode = res.statusCode
		throw err
	}
}

/**
 * Discovers Sony PTZ cameras on the network and returns a list of IP addresses.
 * @param timeoutMS Time to wait for responses in milliseconds (Default: 2000)
 */
export async function discover(timeoutMS: number = 2000): Promise<string[]> {
	const message = Buffer.concat([Buffer.from([0x02]), Buffer.from('ENQ:network'), Buffer.from([0xff, 0x03])])

	const client = dgram.createSocket('udp4')
	const foundIPs = new Set<string>()

	return new Promise((resolve, reject) => {
		client.on('error', (err) => {
			client.close()
			reject(err)
		})

		client.on('message', (msg, _) => {
			const content = msg.toString('ascii')
			const ipMatch = content.match(/IPADR:([\d.]+)/)
			if (ipMatch && ipMatch[1]) {
				foundIPs.add(ipMatch[1])
			}
		})

		client.bind(() => {
			client.setBroadcast(true)
			client.send(message, 0, message.length, 52380, '255.255.255.255', (err) => {
				if (err) {
					client.close()
					reject(err)
				}
			})
		})

		setTimeout(() => {
			client.close()
			resolve(Array.from(foundIPs))
		}, timeoutMS)
	})
}
