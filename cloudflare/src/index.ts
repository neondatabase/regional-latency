/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import nqb, { QueryRecordPayload } from 'neon-query-bench';

export default {
	async fetch(request: Request, env: Record<string, string | undefined>, ctx: ExecutionContext): Promise<Response> {
		if (!request.cf || typeof request.cf.colo !== 'string') {
			throw new Error('unable to determine cloudflare region');
		}

		const { platform, runner } = nqb(env);

		const queryRunnerResult = await runner({
			apiKey: request.headers.get('x-api-key') as string | undefined,
		});

		const payload: QueryRecordPayload = {
			queryRunnerResult,
			platformName: platform.getPlatformName(),
			platformRegion: request.cf.colo,
		};

		return new Response(JSON.stringify(payload), {
			headers: {
				'content-type': 'application/json;charset=utf-8',
			},
		});
	},
};
