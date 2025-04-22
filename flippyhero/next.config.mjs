/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*).png',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=360000, immutable'
                    },
                    {
                        key: 'Age',
                        value: '360000'
                    }
                ]
            }
        ]
    }
};
export default nextConfig;
