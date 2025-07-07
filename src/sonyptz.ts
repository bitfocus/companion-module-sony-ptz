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
