
export default async function xmLMiddleWare(ctx, next) {
  if (ctx.request.header['content-type'] === 'application/xml') {
    // avoid conflict between xml and text
    ctx.request.header['content-type'] = 'application/xml'
    const xml: string = await new Promise((resolve) => {
      let data = '';
      ctx.req.on('data', (chunk) => data += chunk);
      ctx.req.on('end', () => resolve(data));
    });
    ctx.request.xml = xml;
  }
  else if (ctx.request.header['content-type'] === 'text/xml') {
    ctx.request.xml = ctx.request.body;
  }
  await next();
}
