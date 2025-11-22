import { BattleRecord } from './types';

export const PROGRAM_ID = "9TUfEHvk5fN5vogtQyrefgNqzKy2Bqb4nWVhSFUg2fYo";
export const SOL_PRICE_USD = 145.00; // Mock price for calculations
export const STREAMING_RATE_USD = 0.003; // Spotify avg per stream
export const ARTIST_FEE_BPS = 100; // 1%
export const PLATFORM_FEE_BPS = 50; // 0.5%

// API Credentials
export const HELIUS_API_KEY = "8b84d8d3-59ad-4778-829b-47db8a9149fa";
export const ALCHEMY_API_KEY = "Rhrakm8O0GRJ_q7nMsmDi";
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
export const HELIUS_API_URL = "https://api-mainnet.helius-rpc.com/v0";
export const ALCHEMY_RPC_URL = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Helper to check for test battles (Hurric4n3Ike vs Zaal OR Jave vs Joov)
const isTestBattle = (a1: string, a2: string): boolean => {
  const n1 = a1.toLowerCase();
  const n2 = a2.toLowerCase();
  if (n1.includes('jave') && n2.includes('joov')) return true;
  if (n1.includes('hurric4n3ike') && n2.includes('zaal')) return true;
  if (n1.includes('test') || n2.includes('test')) return true;
  if (n1.includes('zaal wavewarz') && n2.includes('zaal wavewarz')) return true;
  return false;
};

// Raw DB Dump parsing
const rawBattles = [
  { id: "84f69a03-eb95-4813-a7a4-62c0aa18c01b", battle_id: 3243, created_at: "2025-02-26T04:04:05Z", status: "Active", artist1: "Jave", artist2: "Joov", pool1: 0, pool2: 0, duration: 1200, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battle-images/v2/1740542639040-WAVE-WARZ-Verticle.jpg" },
  { id: "db80cebf-3e05-4def-abde-961535b170de", battle_id: 1746558966, created_at: "2025-05-06T19:16:46Z", status: "Active", artist1: "Mario", artist2: "Ike", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1746558965016.jpeg" },
  { id: "cac54041-2ee5-430d-8771-06d551482dc5", battle_id: 1746884297, created_at: "2025-05-10T13:38:29Z", status: "Active", artist1: "Gneric", artist2: "Zaal", pool1: 0, pool2: 0, duration: 600, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1746884296837.jpeg" },
  { id: "ad7efa3d-d892-43b7-b0c8-f9989d3d6115", battle_id: 1747090962, created_at: "2025-05-12T23:03:39Z", status: "Active", artist1: "Prizem", artist2: "Jango", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1747090961016.jpeg" },
  { id: "e56086c0-05cd-4015-b1cb-8ccd8f4ba55d", battle_id: 1747405444, created_at: "2025-05-16T14:24:35Z", status: "Active", artist1: "Hurric4n3Ike", artist2: "Jango UU", pool1: 0, pool2: 0, duration: 600, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1747405443675.jpeg" },
  { id: "92abc84b-99b8-4379-af4c-3279bc57e2be", battle_id: 1747426335, created_at: "2025-05-16T20:12:39Z", status: "Active", artist1: "John", artist2: "Hurric4n3Ike", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1747426335104.jpeg" },
  { id: "e6b67258-1ee1-47c6-9fbb-98517d016f35", battle_id: 1747674568, created_at: "2025-05-19T17:09:42Z", status: "Active", artist1: "Ayye", artist2: "Joov", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1747674567326.jpeg" },
  { id: "2ec4eec1-ae84-45a3-b640-2d478347d78e", battle_id: 1747723518, created_at: "2025-05-20T06:45:28Z", status: "Active", artist1: "Jango UU", artist2: "Hurric4n3Ike", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1747723517966.jpeg" },
  { id: "a18d5555-1363-4852-8ef2-109f02295d28", battle_id: 1748146416, created_at: "2025-05-25T04:13:53Z", status: "Active", artist1: "Viber", artist2: "Thriver", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748146415781.jpeg" },
  { id: "3a56a020-c3b2-4d31-8ba1-a2710bcd7533", battle_id: 1748182662, created_at: "2025-05-25T14:18:00Z", status: "Active", artist1: "Cooler", artist2: "Freiza", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748182661406.jpeg" },
  { id: "1c0e88c2-5181-4568-a243-20fe4db1351b", battle_id: 1748195438, created_at: "2025-05-25T17:50:56Z", status: "Active", artist1: "BatMan", artist2: "SuperMan", pool1: 0, pool2: 0, duration: 400, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748195436956.jpeg" },
  { id: "6a94c279-4384-43b5-8a59-154c89ac83b1", battle_id: 1748196430, created_at: "2025-05-25T18:07:27Z", status: "Active", artist1: "Cool Guy", artist2: "Chill Guy", pool1: 0, pool2: 0, duration: 86400, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748196429306.jpeg" },
  { id: "c499e966-8d52-49da-8949-b1c1dc5b7b76", battle_id: 1748214190, created_at: "2025-05-25T23:03:24Z", status: "Active", artist1: "Uhhh", artist2: "Duhhh", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748214189120.jpeg" },
  { id: "b14ba68a-af43-450a-b89f-0be11f27f52e", battle_id: 1748216127, created_at: "2025-05-25T23:35:52Z", status: "Active", artist1: "Deem", artist2: "Dim", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748216126678.jpeg" },
  { id: "1fce42c7-244f-48c0-a20a-0a5f1cff4342", battle_id: 1748233241, created_at: "2025-05-26T04:21:21Z", status: "Active", artist1: "Cool G", artist2: "Chill G", pool1: 0, pool2: 0, duration: 86400, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748233240209.jpeg" },
  { id: "03010677-3305-48c6-994f-d2dfede21590", battle_id: 1748266903, created_at: "2025-05-26T13:42:04Z", status: "Active", artist1: "We", artist2: "Did It", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748266902609.jpeg" },
  { id: "7083e520-3efb-44ce-9c4f-b422602d2b22", battle_id: 1748348915, created_at: "2025-05-27T12:28:59Z", status: "Active", artist1: "Cool Gu", artist2: "Chill Gu", pool1: 0, pool2: 0, duration: 300, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748348914666.jpeg" },
  { id: "f3038630-a39b-4221-a2d0-719c8c8ace4a", battle_id: 1748420717, created_at: "2025-05-28T08:25:42Z", status: "Active", artist1: "RaWavez x Hurric4n3Ike", artist2: "StretchWavez x Hurric4n3Ike", pool1: 0, pool2: 0, duration: 55800, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748420717375.png" },
  { id: "0eda3290-c6d0-4bf8-8f15-b0c0f559eaf3", battle_id: 1748478141, created_at: "2025-05-29T00:22:58Z", status: "Active", artist1: "PROF!T", artist2: "RoCkY2GriMeY", pool1: 0, pool2: 0, duration: 1800, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1748478143322.png" },
  { id: "44c80884-0a36-4edc-b4a7-e042112ce513", battle_id: 1749170272, created_at: "2025-06-06T00:38:09Z", status: "Active", artist1: "Chill Sample Hub", artist2: "PKMN CTO", pool1: 0, pool2: 0, duration: 900, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1749170272700.jpeg" },
  { id: "b5cbb0b0-ce82-4bbe-b278-2b8556991b5e", battle_id: 1749745042, created_at: "2025-06-12T16:17:41Z", status: "Active", artist1: "Harrdknock Freestyle x PR0F!T", artist2: "NOT THE SAME x PR0F!T", pool1: 0, pool2: 0, duration: 1200, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1749745041653.jpeg" },
  { id: "124f2a9e-8327-4e81-a845-221e1b60c0f4", battle_id: 1749831684, created_at: "2025-06-13T16:22:01Z", status: "Active", artist1: "AYOTEMI", artist2: "JED XO", pool1: 0, pool2: 0, duration: 2100, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1749831684141.jpeg" },
  { id: "10ad670e-aa1f-4870-b831-46eb7da10429", battle_id: 1751830880, created_at: "2025-07-06T19:41:52Z", status: "Active", artist1: "SOUTH OF THE CITY x Jango UU", artist2: "DUAL WIELD x Jango UU", pool1: 0, pool2: 0, duration: 1200, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1751830879870.jpeg" },
  { id: "175cd676-5a4d-4b9c-9dde-6a2e0607b6aa", battle_id: 1751834766, created_at: "2025-07-06T20:46:32Z", status: "Active", artist1: "CIGS OUTSIDE x Jango UU", artist2: "SHATTERPOINT x Jango UU", pool1: 0, pool2: 0, duration: 1200, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1751834766445.jpeg" },
  { id: "0d9e93d9-8a8b-4066-a416-8b91be27078d", battle_id: 1753059842, created_at: "2025-07-21T01:04:25Z", status: "Active", artist1: "Cannon Jones", artist2: "Chief", pool1: 0, pool2: 0, duration: 1200, img: "https://assets.wavewarz.com/battles/1753059842251-987pnr.jpg" },
  { id: "bba2dc4e-f939-4e2c-bb3b-6bc21eaeb906", battle_id: 1757896802, created_at: "2025-09-15T00:40:33Z", status: "Active", artist1: "LexiBanti", artist2: "Preshzino Songz", pool1: 0, pool2: 0, duration: 1200, img: "https://assets.wavewarz.com/battles/1757896802445-v3gxk2.jpg" },
  { id: "0fb3f761-52ea-4559-a0c7-07a7c02fc43c", battle_id: 1758503315, created_at: "2025-09-22T01:08:56Z", status: "Active", artist1: "$BONGA: VibeLord", artist2: "$STUPID: Atchblockbaby", pool1: 0, pool2: 0, duration: 1200, img: "https://assets.wavewarz.com/battles/1758503314807-gmu21z.jpg" },
  { id: "4516c7b8-f7c5-4267-9300-5eba8bc19617", battle_id: 1758731739, created_at: "2025-09-24T16:35:49Z", status: "Active", artist1: "StarWavez x Hurric4n3Ike", artist2: "StretchWavez x Hurric4n3Ike", pool1: 0, pool2: 0, duration: 660, img: "https://assets.wavewarz.com/battles/1758731739460-w68w87.jpeg" },
  { id: "ef7e6cf0-c05a-46c8-9dcc-1700604818a7", battle_id: 1757207855, created_at: "2025-09-07T01:18:16Z", status: "Active", artist1: "Cannon Jones973", artist2: "IAmThanos", pool1: 0, pool2: 0, duration: 9000, img: "https://assets.wavewarz.com/battles/1757207855920-br2dz9.jpg" },
  { id: "b9969caa-12f9-4377-b221-c374c79ae307", battle_id: 1753662580, created_at: "2025-07-28T00:30:30Z", status: "Active", artist1: "One", artist2: "Krem", pool1: 0, pool2: 0, duration: 900, img: "https://assets.wavewarz.com/battles/1753662580110-s5ijt6.jpg" },
  { id: "23b54e0b-4268-436f-8fcb-bd2d943bbb50", battle_id: 1756687169, created_at: "2025-09-01T00:39:55Z", status: "Active", artist1: "Lui", artist2: "Stilo", pool1: 0, pool2: 0, duration: 1800, img: "https://assets.wavewarz.com/battles/1756687169292-rtr2hk.jpg" },
  { id: "c166398f-2dd4-433f-8575-d0c6c74ad5c5", battle_id: 1762045944, created_at: "2025-11-02T01:13:04Z", status: "Active", artist1: "Owskie", artist2: "Omg.Suavee", pool1: 0, pool2: 0, duration: 900, img: "https://assets.wavewarz.com/battles/1762045944518-0k825b.jpg" },
  { id: "56bdac0f-4c2a-4dce-8c04-ae2da69f57e2", battle_id: 1762047861, created_at: "2025-11-02T01:44:39Z", status: "Active", artist1: "12xce", artist2: "T.I.G.O", pool1: 0, pool2: 0, duration: 900, img: "https://assets.wavewarz.com/battles/1762047861632-s8zgee.jpg" },
  { id: "74f6913e-9794-46cc-a992-2ab1176d98be", battle_id: 1762049633, created_at: "2025-11-02T02:14:25Z", status: "Active", artist1: "12xce", artist2: "Omg.Suavee", pool1: 0, pool2: 0, duration: 900, img: "https://assets.wavewarz.com/battles/1762049633903-764t4l.jpg" },
  { id: "127508ac-3a29-4d92-ad90-0714ee26e566", battle_id: 1758643634, created_at: "2025-09-23T16:07:57Z", status: "Active", artist1: "SOLWavez x Hurric4n3Ike", artist2: "WaitWavez x Hurric4n3Ike", pool1: 0, pool2: 0, duration: 660, img: "https://assets.wavewarz.com/battles/1758643634725-jkuhd9.jpg" },
  { id: "d79b5232-054b-4562-9561-f869e578292e", battle_id: 1762656537, created_at: "2025-11-09T02:49:18Z", status: "Active", artist1: "CDOTT & STAKKS", artist2: "Owskie", pool1: 0, pool2: 0, duration: 1260, img: "https://assets.wavewarz.com/battles/1762656528616-fy4j98.jpeg" },
  { id: "a5636c44-20eb-4c19-8b5c-5e839a9f1bb6", battle_id: 1762659948, created_at: "2025-11-09T03:46:13Z", status: "Active", artist1: "LEØN", artist2: "Owskie", pool1: 0, pool2: 0, duration: 1500, img: "https://assets.wavewarz.com/battles/1762659945163-x4ukey.jpeg" },
  { id: "cdc2eb7a-2395-4aff-9aad-4d9f244a9bd9", battle_id: 1762662113, created_at: "2025-11-09T04:21:57Z", status: "Active", artist1: "Owskie", artist2: "T.I.G.O.", pool1: 0, pool2: 0, duration: 1500, img: "https://assets.wavewarz.com/battles/1762662110844-hoyvv0.jpeg" },
  { id: "b43666e6-9359-4ccc-a1c4-d24ae5dfb3f6", battle_id: 1762701962, created_at: "2025-11-09T15:26:11Z", status: "Active", artist1: "Zaal WaveWarZ 1", artist2: "Zaal WaveWarZ 2", pool1: 0, pool2: 0, duration: 1800, img: "https://assets.wavewarz.com/battles/1762701956591-shpay4.png" },
  { id: "fcfd6cad-dc07-4923-95d8-09c2435a241c", battle_id: 1762738383, created_at: "2025-11-10T01:33:29Z", status: "Active", artist1: "Yoshiro Mare", artist2: "Davyd", pool1: 0, pool2: 0, duration: 1260, img: "https://assets.wavewarz.com/battles/1762738382605-rmr413.jpg" },
  { id: "11baa01a-5068-4a16-b06f-d8147bf44778", battle_id: 1763042352, created_at: "2025-11-13T13:59:21Z", status: "Active", artist1: "UdeWavez x Hurric4n3Ike", artist2: "ConceptWavez x Hurric4n3Ike", pool1: 0, pool2: 0, duration: 86400, img: "https://assets.wavewarz.com/battles/1763042333694-osayhs.jpg" },
  { id: "0a122a62-1981-44d6-b85c-97da60983fe1", battle_id: 1763257861, created_at: "2025-11-16T01:51:06Z", status: "Active", artist1: "TRILOGY", artist2: "12XCE", pool1: 0, pool2: 0, duration: 1500, img: "https://assets.wavewarz.com/battles/1763257857915-gz9a6c.jpeg" },
  { id: "ef2f5030-c830-4474-9c5b-e35d9a6ae4bf", battle_id: 1763260055, created_at: "2025-11-16T02:27:41Z", status: "Active", artist1: "OWSKIE", artist2: "V.D.O.", pool1: 0, pool2: 0, duration: 1800, img: "https://assets.wavewarz.com/battles/1763260052726-59gjo4.jpeg" },
  { id: "5b0b011d-a66a-4cc9-90a1-9d739d81e785", battle_id: 1763262073, created_at: "2025-11-16T03:01:18Z", status: "Active", artist1: "TRILOGY", artist2: "OWSKIE", pool1: 0, pool2: 0, duration: 1800, img: "https://assets.wavewarz.com/battles/1763262068780-kwhzo4.jpeg" },
  { id: "45c32f1b-68f7-43d2-b54a-236bfe0b9bfc", battle_id: 1763264896, created_at: "2025-11-16T03:48:24Z", status: "Active", artist1: "T.I.G.O.", artist2: "OWSKIE", pool1: 0, pool2: 0, duration: 1800, img: "https://assets.wavewarz.com/battles/1763264889062-isxm73.jpeg" },
  // Test Battles: Hurric4n3Ike vs Zaal
  { id: "bf2e0385-7e40-419a-9d16-03cd2780d4da", battle_id: 1748385100, created_at: "2025-05-27T22:32:01Z", status: "Active", artist1: "Hurric4n3Ike", artist2: "Zaal", pool1: 0, pool2: 0, duration: 600, img: "https://assets.wavewarz.com/battles/v2-battle-1748385098905.jpeg" },
  { id: "63f2d955-d2f6-494d-ba34-649d447d66e2", battle_id: 1748387260, created_at: "2025-05-27T23:08:09Z", status: "Active", artist1: "Hurric4n3Ike", artist2: "Zaal", pool1: 0, pool2: 0, duration: 1200, img: "https://assets.wavewarz.com/battles/v2-battle-1748387259570.jpeg" },
  { id: "f5ad50a1-ec33-4074-806a-339f650982bf", battle_id: 1748408291, created_at: "2025-05-28T04:58:39Z", status: "Active", artist1: "Hurric4n3Ike", artist2: "Zaal", pool1: 0, pool2: 0, duration: 1200, img: "https://assets.wavewarz.com/battles/v2-battle-1748408290719.jpeg" },
  { id: "e3f75ef4-6124-4fda-9fcb-8914f2d46e6e", battle_id: 1744205955, created_at: "2025-04-09T13:39:42Z", status: "Active", artist1: "Jave", artist2: "Joov", pool1: 0, pool2: 0, duration: 86400, img: "https://htqvtdqcswxwaonkrnck.supabase.co/storage/v1/object/public/battles/v2-battle-1744205953881.jpeg" }
  // Note: We are including a representative subset of the 50+ Jave vs Joov / Zaal test battles to avoid excessive file size for this demo.
  // In a real app, we would fetch all of them via API. The ID flagging logic works for all of them.
];

// Process Raw Battles into strictly typed BattleRecords
export const INITIAL_BATTLES: BattleRecord[] = rawBattles.map(b => ({
  id: b.id,
  battle_id: b.battle_id,
  created_at: b.created_at,
  status: b.status as 'Active' | 'Completed',
  artist1_name: b.artist1,
  artist2_name: b.artist2,
  artist1_wallet: "MOCK_WALLET_1", // simplified for bulk
  artist2_wallet: "MOCK_WALLET_2", // simplified for bulk
  wavewarz_wallet: "FNjYtwKVsbQzSmoBgLqa8ZGSJTzexQJi6xmV97iakq37",
  artist1_music_link: "https://example.com",
  artist2_music_link: "https://example.com",
  image_url: b.img,
  artist1_pool: Math.random() * 5 * 1e9, // Random mock pools since DB had 0
  artist2_pool: Math.random() * 5 * 1e9,
  artist1_supply: 1000,
  artist2_supply: 1000,
  battle_duration: b.duration,
  winner_decided: false,
  winner_artist_a: null,
  artist1_twitter: null,
  artist2_twitter: null,
  stream_link: "https://www.twitch.tv/wavewarzofficial",
  isTest: isTestBattle(b.artist1, b.artist2)
}));
