export const getUploadThingFileKey = (value: string): string | undefined => {
	const appId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID;
	if (!appId) return;

	const url = URL.parse(value);
	if (!url || url.protocol !== "https:") return;

	const prefix =
		url.hostname === `${appId}.ufs.sh`
			? "/f/"
			: url.hostname === "utfs.io"
				? `/a/${appId}/`
				: undefined;

	if (!prefix || !url.pathname.startsWith(prefix)) return;
	const key = url.pathname.slice(prefix.length);
	if (/^[\w-]+$/.test(key)) return key;
};
