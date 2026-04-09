
/* ==========================================
   VISIBILITY API â€” Pause canvas when tab hidden
   ========================================== */
let isPageVisible = true;
document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
});
const BUILD_VERSION = '2026-03-31-portfolio-fix-18';
        (() => {
            try {
                const key = 'portfolio_build_version';
                const previous = localStorage.getItem(key);
                if (previous === BUILD_VERSION) return;

                localStorage.setItem(key, BUILD_VERSION);
                const url = new URL(window.location.href);
                if (url.searchParams.get('v') !== BUILD_VERSION) {
                    url.searchParams.set('v', BUILD_VERSION);
                    window.location.replace(url.toString());
                }
            } catch (_) { }
        })();

        /* ==========================================
           VIDEO DATA CONFIGURATION
           ========================================== */
        const PORTFOLIO_VIDEOS = [
            { id: 'patricia-1', title: 'Patricia vídeo 1', src: 'https://jesielpsd.wistia.com/medias/jtnyivfrso', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'criativo-flash', title: 'Erros que você comete', src: 'https://jesielpsd.wistia.com/medias/ufin45cnpl', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'ranking-iphone', title: 'Ranking IPhones', src: 'https://jesielpsd.wistia.com/medias/jqjwkq9gr4', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'tatuador', title: 'Tatuador X Tatuagem', src: 'https://jesielpsd.wistia.com/medias/dfyout86oe', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'werner', title: 'Werner Reck', src: 'https://jesielpsd.wistia.com/medias/7e1hh5qdfa', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'marcel', title: 'Marcel ', src: 'https://jesielpsd.wistia.com/medias/31tnh1gpq6', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'eduarda', title: 'Depoimento KiKalor', src: 'https://jesielpsd.wistia.com/medias/sncg1wvcni', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'comunicacao-gestante', title: 'Comunicação para Gestante', src: 'https://jesielpsd.wistia.com/medias/ep0van8js0', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'recupera-agil', title: 'Recupera Ágil', src: 'https://jesielpsd.wistia.com/medias/0r7bqvvbrg', sections: ['criativos', 'verticais'], aspect: 'vertical' },
            { id: 'elite-pet', title: 'Elite Pet Company', src: 'https://jesielpsd.wistia.com/medias/beykp2vdzj', sections: ['motions', 'horizontais'], aspect: 'horizontal' },
            { id: 'urus', title: 'URUS Plataforma', src: 'https://jesielpsd.wistia.com/medias/xji6cvgi54', sections: ['motions', 'verticais'], aspect: 'vertical' },
            { id: 'uana', title: 'Uana Amorim (video teste)', src: 'https://jesielpsd.wistia.com/medias/smrpb8r8k7', sections: ['videos-longos', 'horizontais'], aspect: 'horizontal', isLong: true }
        ];

        const PORTFOLIO_VIDEO_MAP = Object.fromEntries(
            PORTFOLIO_VIDEOS.map(video => [video.id, video])
        );

        // To reorder a folder, just move the ids inside the matching list below.
        const SECTION_VIDEO_ORDER = {
            'criativos': ['patricia-1', 'criativo-flash', 'comunicacao-gestante', 'recupera-agil', 'eduarda', 'ranking-iphone', 'tatuador', 'werner', 'marcel'],
            'motions': ['elite-pet', 'urus'],
            'videos-longos': ['uana'],
            'verticais': ['patricia-1', 'criativo-flash', 'urus', 'comunicacao-gestante', 'ranking-iphone', 'tatuador', 'werner', 'marcel', 'eduarda', 'recupera-agil',],
            'horizontais': ['uana', 'elite-pet']
        };

        const SECTION_NAMES = {
            'criativos': 'Criativos', 'motions': 'Motions', 'videos-longos': 'Videos longos', 'verticais': 'Verticais', 'horizontais': 'Horizontais'
        };

        const PREVIEW_TIME = 5;
        const DEFAULT_WISTIA_VIDEO_VOLUME = 0.8;
        const DEFAULT_WISTIA_AUDIO_VOLUME = 0.8;
        let currentFolder = null;

        function getVideosForSection(sectionId) {
            const orderedIds = SECTION_VIDEO_ORDER[sectionId];

            if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
                return PORTFOLIO_VIDEOS.filter(video => video.sections.includes(sectionId));
            }

            const orderedVideos = orderedIds
                .map(id => PORTFOLIO_VIDEO_MAP[id])
                .filter(video => video && video.sections.includes(sectionId));

            const orderedVideoIds = new Set(orderedVideos.map(video => video.id));
            const remainingVideos = PORTFOLIO_VIDEOS.filter(video =>
                video.sections.includes(sectionId) && !orderedVideoIds.has(video.id)
            );

            return [...orderedVideos, ...remainingVideos];
        }

        function initFolderMeta() {
            const usedWistiaIds = new Set();

            Object.keys(SECTION_NAMES).forEach(sectionId => {
                const videos = getVideosForSection(sectionId);
                const count = videos.length;
                const el = document.getElementById(`meta-${sectionId}`);
                if (el) el.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;

                // Real wista thumbnails on folder hover
                if (videos.length > 0) {
                    let selectedVideo = videos[0];
                    for (const v of videos) {
                        const mid = getWistiaMediaId(v.src);
                        if (mid && !usedWistiaIds.has(mid)) {
                            selectedVideo = v;
                            break;
                        }
                    }

                    const mediaId = getWistiaMediaId(selectedVideo.src);
                    if (mediaId) {
                        usedWistiaIds.add(mediaId);
                        fetch(`https://fast.wistia.net/oembed?url=${encodeURIComponent(selectedVideo.src)}`)
                            .then(res => res.json())
                            .then(data => {
                                if (data && data.thumbnail_url) {
                                    const imgEl = document.querySelector(`image.dynamic-thumb[data-section="${sectionId}"]`);
                                    if (imgEl) {
                                        imgEl.setAttribute('href', data.thumbnail_url);
                                    }
                                }
                            }).catch(err => console.error("Error fetching Wistia thumb for", sectionId, err));
                    }
                }
            });
        }

        const SVGs = {
            play: '<svg viewBox="0 0 24 24"><polygon fill="none" points="7 4 19 12 7 20 7 4"/></svg>',
            pause: '<svg viewBox="0 0 24 24"><rect fill="none" x="6" y="4" width="4" height="16" rx="1"/><rect fill="none" x="14" y="4" width="4" height="16" rx="1"/></svg>',
            mute: '<svg viewBox="0 0 24 24"><path fill="none" d="M11 5 6 9H3v6h3l5 4V5Z"/><path fill="none" d="m16 9 5 5"/><path fill="none" d="m21 9-5 5"/></svg>',
            unmute: '<svg viewBox="0 0 24 24"><path fill="none" d="M11 5 6 9H3v6h3l5 4V5Z"/><path fill="none" d="M15.5 8.5a5 5 0 0 1 0 7"/><path fill="none" d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>'
        };

        let youtubeApiReadyPromise = null;
        const youtubePlayers = new WeakMap();
        const youtubePlayerPromises = new WeakMap();
        let wistiaApiReadyPromise = null;
        const wistiaPlayers = new WeakMap();
        const wistiaPlayerPromises = new WeakMap();

        function ensureYouTubeApiReady() {
            if (window.YT && typeof window.YT.Player === 'function') {
                return Promise.resolve(window.YT);
            }

            if (youtubeApiReadyPromise) return youtubeApiReadyPromise;

            youtubeApiReadyPromise = new Promise((resolve, reject) => {
                const existingReady = window.onYouTubeIframeAPIReady;
                const timeoutId = window.setTimeout(() => {
                    reject(new Error('YouTube IFrame API failed to load.'));
                }, 15000);

                window.onYouTubeIframeAPIReady = () => {
                    window.clearTimeout(timeoutId);
                    if (typeof existingReady === 'function') existingReady();
                    resolve(window.YT);
                };

                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                script.onerror = () => {
                    window.clearTimeout(timeoutId);
                    reject(new Error('Unable to load YouTube IFrame API.'));
                };
                document.head.appendChild(script);
            });

            return youtubeApiReadyPromise;
        }

        function ensureWistiaApiReady() {
            if (window.Wistia || window._wq) {
                return Promise.resolve();
            }

            if (wistiaApiReadyPromise) return wistiaApiReadyPromise;

            wistiaApiReadyPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                const timeoutId = window.setTimeout(() => {
                    reject(new Error('Wistia player.js failed to load.'));
                }, 15000);

                script.src = 'https://fast.wistia.net/player.js';
                script.async = true;
                script.onload = () => {
                    window.clearTimeout(timeoutId);
                    resolve();
                };
                script.onerror = () => {
                    window.clearTimeout(timeoutId);
                    reject(new Error('Unable to load Wistia player.js.'));
                };
                document.head.appendChild(script);
            });

            return wistiaApiReadyPromise;
        }

        function getVideoSourceType(src) {
            if (/(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(src)) return 'youtube';
            if (getWistiaMediaId(src)) return 'wistia';
            return 'file';
        }

        function getYouTubeVideoId(src) {
            const match = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i);
            return match ? match[1] : '';
        }

        function getYouTubeEmbedUrl(src, autoplay = false) {
            const videoId = getYouTubeVideoId(src);
            if (!videoId) return src;

            const params = new URLSearchParams({
                autoplay: autoplay ? '1' : '0',
                controls: '0',
                disablekb: '1',
                fs: '0',
                rel: '0',
                modestbranding: '1',
                playsinline: '1',
                enablejsapi: '1'
            });

            if (window.location.origin && /^https?:/i.test(window.location.origin)) {
                params.set('origin', window.location.origin);
            }

            return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }

        function getWistiaMediaId(src) {
            if (!src) return '';

            const normalizedSrc = String(src).trim();
            const patterns = [
                /fast\.wistia\.(?:net|com)\/embed\/iframe\/([a-z0-9]+)/i,
                /(?:https?:\/\/)?(?:[\w-]+\.)?wistia\.(?:com|net)\/medias\/([a-z0-9]+)/i,
                /(?:https?:\/\/)?(?:[\w-]+\.)?wistia\.(?:com|net)\/embed\/medias\/([a-z0-9]+)/i,
                /[?&]wvideo=([a-z0-9]+)/i
            ];

            for (const pattern of patterns) {
                const match = normalizedSrc.match(pattern);
                if (match) return match[1];
            }

            return /^[a-z0-9]{10}$/i.test(normalizedSrc) ? normalizedSrc : '';
        }

        function getWistiaEmbedUrl(src, autoplay = false) {
            const mediaId = getWistiaMediaId(src);
            if (!mediaId) return src;

            const params = new URLSearchParams({
                web_component: 'true',
                seo: 'false',
                videoFoam: 'false',
                controlsVisibleOnLoad: 'false',
                playbar: 'false',
                playButton: 'false',
                smallPlayButton: 'false',
                fullscreenButton: 'false',
                volumeControl: 'false',
                settingsControl: 'false',
                qualityControl: 'false',
                playbackRateControl: 'false',
                copyLinkAndThumbnailEnabled: 'false',
                playPauseNotifier: 'false',
                transcript: 'false',
                'plugin[videoThumbnail][clickToPlayButton]': 'false'
            });

            if (autoplay) params.set('autoPlay', 'true');

            return `https://fast.wistia.net/embed/iframe/${mediaId}?${params.toString()}`;
        }

        const wistiaMediaCache = new Map();
        const wistiaThumbCache = new Map();
        const wistiaPlayableCache = new Map();
        const wistiaVideoSourcePromises = new WeakMap();

        function getWistiaAssetUrl(asset) {
            return String(asset?.url || '');
        }

        function getWistiaAssetType(asset) {
            return String(asset?.type || '').toLowerCase();
        }

        function getWistiaAssetExt(asset) {
            return String(asset?.ext || '').toLowerCase();
        }

        function getWistiaAssetMetric(asset, key) {
            const value = Number(asset?.[key]);
            return Number.isFinite(value) ? value : 0;
        }

        function isWistiaNonHlsAsset(asset) {
            const assetUrl = getWistiaAssetUrl(asset);
            return assetUrl && !/\.m3u8(\?|$)/i.test(assetUrl);
        }

        function isWistiaAudioAsset(asset) {
            const type = getWistiaAssetType(asset);
            const ext = getWistiaAssetExt(asset);
            return /audio/.test(type) || ['mp3', 'm4a', 'aac', 'wav', 'ogg'].includes(ext);
        }

        function isWistiaImageAsset(asset) {
            const type = getWistiaAssetType(asset);
            const ext = getWistiaAssetExt(asset);
            return /still_image|storyboard/.test(type) || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        }

        function isWistiaVideoAsset(asset) {
            if (!isWistiaNonHlsAsset(asset) || isWistiaAudioAsset(asset) || isWistiaImageAsset(asset)) {
                return false;
            }

            const type = getWistiaAssetType(asset);
            const ext = getWistiaAssetExt(asset);
            return /video/.test(type) || ext === 'mp4' || /original/.test(type);
        }

        function rankWistiaVideoAssets(a, b) {
            return getWistiaAssetMetric(b, 'height') - getWistiaAssetMetric(a, 'height') ||
                getWistiaAssetMetric(b, 'width') - getWistiaAssetMetric(a, 'width') ||
                getWistiaAssetMetric(b, 'bitrate') - getWistiaAssetMetric(a, 'bitrate');
        }

        function rankWistiaAudioAssets(a, b) {
            const getPriority = (asset) => {
                const type = getWistiaAssetType(asset);
                const ext = getWistiaAssetExt(asset);
                if (/mp3_audio/.test(type)) return 3;
                if (ext === 'mp3') return 2;
                if (isWistiaAudioAsset(asset)) return 1;
                if (/original/.test(type)) return 0;
                return -1;
            };

            return getPriority(b) - getPriority(a) ||
                getWistiaAssetMetric(b, 'bitrate') - getWistiaAssetMetric(a, 'bitrate');
        }

        function selectBestWistiaAsset(assets, kind = 'video') {
            const playableAssets = (Array.isArray(assets) ? assets : []).filter(isWistiaNonHlsAsset);
            if (playableAssets.length === 0) return null;

            if (kind === 'audio') {
                const audioCandidates = playableAssets
                    .filter(asset => isWistiaAudioAsset(asset) || /original/.test(getWistiaAssetType(asset)))
                    .sort(rankWistiaAudioAssets);

                return audioCandidates[0] || playableAssets[0] || null;
            }

            const mp4VideoCandidates = playableAssets
                .filter(asset => isWistiaVideoAsset(asset) && getWistiaAssetExt(asset) === 'mp4')
                .sort(rankWistiaVideoAssets);

            if (mp4VideoCandidates.length > 0) {
                return mp4VideoCandidates[0];
            }

            const fallbackVideoCandidates = playableAssets
                .filter(isWistiaVideoAsset)
                .sort(rankWistiaVideoAssets);

            return fallbackVideoCandidates[0] || playableAssets[0] || null;
        }

        function applyDefaultWistiaVideoVolume(video) {
            if (!video) return;
            video.volume = DEFAULT_WISTIA_VIDEO_VOLUME;
        }

        function applyDefaultWistiaAudioVolume(audio) {
            if (!audio) return;
            audio.volume = DEFAULT_WISTIA_AUDIO_VOLUME;
        }

        function getCanonicalWistiaUrl(src) {
            const rawSrc = String(src || '').trim();
            const mediaId = getWistiaMediaId(rawSrc);
            if (!mediaId) return rawSrc;
            return /^https?:/i.test(rawSrc) ? rawSrc : `https://jesielpsd.wistia.com/medias/${mediaId}`;
        }

        async function fetchWistiaMediaData(src) {
            const mediaId = getWistiaMediaId(src);
            if (!mediaId) return null;

            if (!wistiaMediaCache.has(mediaId)) {
                wistiaMediaCache.set(
                    mediaId,
                    fetch(`https://fast.wistia.com/embed/medias/${mediaId}.json`)
                        .then(response => {
                            if (!response.ok) throw new Error(`Wistia media ${mediaId} unavailable`);
                            return response.json();
                        })
                        .catch(error => {
                            console.error('Error fetching Wistia media data:', mediaId, error);
                            return null;
                        })
                );
            }

            return wistiaMediaCache.get(mediaId);
        }

        async function resolveWistiaPlayableUrl(src, kind = 'video') {
            const mediaId = getWistiaMediaId(src);
            if (!mediaId) return String(src || '');

            const cacheKey = `${kind}:${mediaId}`;
            if (wistiaPlayableCache.has(cacheKey)) {
                return wistiaPlayableCache.get(cacheKey);
            }

            const promise = fetchWistiaMediaData(src).then(data => {
                const assets = Array.isArray(data?.media?.assets) ? data.media.assets : [];
                return selectBestWistiaAsset(assets, kind)?.url || '';
            });

            wistiaPlayableCache.set(cacheKey, promise);
            return promise;
        }

        async function resolveWistiaThumbnailUrl(src) {
            const mediaId = getWistiaMediaId(src);
            if (!mediaId) return '';

            if (wistiaThumbCache.has(mediaId)) {
                return wistiaThumbCache.get(mediaId);
            }

            const canonicalUrl = getCanonicalWistiaUrl(src);
            const promise = fetch(`https://fast.wistia.net/oembed?url=${encodeURIComponent(canonicalUrl)}`)
                .then(response => {
                    if (!response.ok) throw new Error(`Wistia thumb ${mediaId} unavailable`);
                    return response.json();
                })
                .then(data => {
                    const thumbUrl = data?.thumbnail_url ||
                        data?.url ||
                        (typeof data?.html === 'string' ? (data.html.match(/src="([^"]+)"/i)?.[1] || '') : '');
                    return thumbUrl ? thumbUrl.replace(/^http:\/\//i, 'https://') : '';
                })
                .catch(error => {
                    console.error('Error fetching Wistia thumbnail:', mediaId, error);
                    return '';
                });

            wistiaThumbCache.set(mediaId, promise);
            return promise;
        }

        async function ensureVideoSource(video) {
            if (!video) return '';

            const existingSrc = video.currentSrc || video.getAttribute('src') || '';
            if (existingSrc) {
                if (video.dataset.wistiaSrc) applyDefaultWistiaVideoVolume(video);
                return existingSrc;
            }

            if (wistiaVideoSourcePromises.has(video)) {
                return wistiaVideoSourcePromises.get(video);
            }

            const wistiaSrc = video.dataset.wistiaSrc || '';
            if (!wistiaSrc) return '';

            const sourcePromise = resolveWistiaPlayableUrl(wistiaSrc, 'video').then(resolvedUrl => {
                if (resolvedUrl) {
                    video.src = resolvedUrl;
                    video.dataset.resolvedSrc = resolvedUrl;
                    applyDefaultWistiaVideoVolume(video);
                    video.load();
                }
                return resolvedUrl;
            });

            wistiaVideoSourcePromises.set(video, sourcePromise);
            return sourcePromise;
        }

        function resetYouTubeIframe(iframe) {
            if (!iframe) return;

            iframe.dataset.playing = 'false';
            setVideoCardPlayingState(iframe, false);

            const player = youtubePlayers.get(iframe);
            if (!player) return;

            try {
                player.pauseVideo();
                player.seekTo(0, true);
            } catch (error) {
                console.log('YouTube reset error:', error);
            }
        }

        function resetWistiaIframe(iframe) {
            if (!iframe) return;

            iframe.dataset.playing = 'false';
            setVideoCardPlayingState(iframe, false);

            const player = wistiaPlayers.get(iframe);
            if (!player) return;

            try {
                if (typeof player.pause === 'function') player.pause();
                if (typeof player.time === 'function') player.time(0);
            } catch (error) {
                console.log('Wistia reset error:', error);
            }
        }

        function ensureYouTubePlayer(iframe) {
            if (youtubePlayers.has(iframe)) {
                return Promise.resolve(youtubePlayers.get(iframe));
            }

            if (youtubePlayerPromises.has(iframe)) {
                return youtubePlayerPromises.get(iframe);
            }

            const playerPromise = ensureYouTubeApiReady().then(() => new Promise((resolve) => {
                const player = new window.YT.Player(iframe, {
                    events: {
                        onReady: () => {
                            youtubePlayers.set(iframe, player);
                            resolve(player);
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                iframe.dataset.playing = 'true';
                                setVideoCardPlayingState(iframe, true);
                            } else if (
                                event.data === window.YT.PlayerState.PAUSED ||
                                event.data === window.YT.PlayerState.ENDED ||
                                event.data === window.YT.PlayerState.CUED
                            ) {
                                iframe.dataset.playing = 'false';
                                setVideoCardPlayingState(iframe, false);
                            }
                        }
                    }
                });
            }));

            youtubePlayerPromises.set(iframe, playerPromise);
            return playerPromise;
        }

        function ensureWistiaPlayer(iframe) {
            if (wistiaPlayers.has(iframe)) {
                return Promise.resolve(wistiaPlayers.get(iframe));
            }

            if (wistiaPlayerPromises.has(iframe)) {
                return wistiaPlayerPromises.get(iframe);
            }

            const playerPromise = ensureWistiaApiReady().then(() => new Promise((resolve, reject) => {
                let attempts = 0;

                const attachPlayer = () => {
                    const player = iframe.wistiaApi;
                    if (!player) {
                        attempts += 1;
                        if (attempts > 40) {
                            reject(new Error('Wistia player handle was not created.'));
                            return;
                        }
                        window.setTimeout(attachPlayer, 150);
                        return;
                    }

                    if (!wistiaPlayers.has(iframe)) {
                        wistiaPlayers.set(iframe, player);

                        if (typeof player.bind === 'function') {
                            player.bind('play', () => {
                                iframe.dataset.playing = 'true';
                                pauseOtherVideos(iframe);
                                setVideoCardPlayingState(iframe, true);
                            });
                            player.bind('pause', () => {
                                iframe.dataset.playing = 'false';
                                setVideoCardPlayingState(iframe, false);
                            });
                            player.bind('end', () => {
                                iframe.dataset.playing = 'false';
                                setVideoCardPlayingState(iframe, false);
                            });
                        }
                    }

                    resolve(player);
                };

                if (iframe.wistiaApi) {
                    attachPlayer();
                    return;
                }

                iframe.addEventListener('load', attachPlayer, { once: true });
            }));

            wistiaPlayerPromises.set(iframe, playerPromise);
            return playerPromise;
        }

        function setVideoCardPlayingState(media, isPlaying) {
            const card = media.closest('.video-card');
            if (!card) return;

            const playOverlay = card.querySelector('.play-overlay');
            const btnPlay = card.querySelector('.btn-play');

            if (playOverlay) playOverlay.classList.toggle('hidden', isPlaying);
            if (btnPlay) btnPlay.innerHTML = isPlaying ? SVGs.pause : SVGs.play;
        }

        function setPortfolioVideoPreview(video) {
            if (!video) return;

            const applyPreview = () => {
                if (video.dataset.hasStarted === 'true' || !video.paused) return;

                const duration = Number.isFinite(video.duration) ? video.duration : 0;
                const previewTime = duration > 0
                    ? Math.min(PREVIEW_TIME, Math.max(duration - 0.25, 0))
                    : 0;

                try {
                    video.currentTime = previewTime;
                } catch (_) { }
            };

            if (video.readyState >= 1) {
                applyPreview();
                return;
            }

            video.addEventListener('loadedmetadata', applyPreview, { once: true });
        }

        function pauseOtherVideos(activeMedia, reset = false) {
            document.querySelectorAll('#video-grid video, #video-grid iframe[data-player-type="youtube"], #video-grid iframe[data-player-type="wistia"]').forEach(otherMedia => {
                if (otherMedia === activeMedia) return;

                if (otherMedia.tagName === 'VIDEO') {
                    otherMedia.pause();
                    if (reset) {
                        otherMedia.dataset.hasStarted = 'false';

                        if (otherMedia.dataset.wistiaSrc) {
                            ensureVideoSource(otherMedia).then(() => {
                                setPortfolioVideoPreview(otherMedia);
                            }).catch(error => console.log('Wistia reset error:', error));
                        } else {
                            try {
                                otherMedia.currentTime = PREVIEW_TIME;
                            } catch (_) { }
                        }
                    }
                    setVideoCardPlayingState(otherMedia, false);
                    return;
                }

                if (reset) {
                    if (otherMedia.dataset.playerType === 'youtube') {
                        resetYouTubeIframe(otherMedia);
                    } else {
                        resetWistiaIframe(otherMedia);
                    }
                    return;
                }

                const player = otherMedia.dataset.playerType === 'youtube'
                    ? youtubePlayers.get(otherMedia)
                    : wistiaPlayers.get(otherMedia);
                if (player) {
                    try {
                        if (otherMedia.dataset.playerType === 'youtube') {
                            player.pauseVideo();
                        } else if (typeof player.pause === 'function') {
                            player.pause();
                        }
                    } catch (error) {
                        console.log(`${otherMedia.dataset.playerType === 'youtube' ? 'YouTube' : 'Wistia'} pause error:`, error);
                    }
                }
                otherMedia.dataset.playing = 'false';
                setVideoCardPlayingState(otherMedia, false);
            });
        }

        function createVideoCard(video, index) {
            const card = document.createElement('div');

            // Add layout logic for spanning rows in mixed mode
            let classes = 'video-card ';
            if (video.aspect === 'horizontal') classes += 'card-span-horizontal ';
            card.className = classes;

            // Staggered modern entrance animation
            card.style.animationDelay = `${index * 0.1}s`;

            const aspectClass = video.aspect === 'vertical' ? 'aspect-vertical' : 'aspect-horizontal';

            // Timeline is shown only if video is marked as long
            const showTimeline = video.isLong ? 'visible' : '';

            const sourceType = getVideoSourceType(video.src);
            const mediaHTML = sourceType === 'youtube'
                ? `
        <div class="card-video-wrap ${aspectClass} has-embed">
            <iframe
                id="youtube-player-${video.id}"
                data-player-type="youtube"
                data-embed-src="${getYouTubeEmbedUrl(video.src)}"
                src="${getYouTubeEmbedUrl(video.src)}"
                title="${video.title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
            <div class="play-overlay">
                <div class="play-btn">${SVGs.play}</div>
            </div>
            
            <div class="custom-controls">
                <div class="controls-buttons">
                    <div class="controls-left">
                        <button class="control-btn btn-play">${SVGs.play}</button>
                    </div>
                </div>
            </div>
        </div>`
                : `
        <div class="card-video-wrap ${aspectClass}">
            <video preload="metadata" loop playsinline ${sourceType === 'wistia'
                    ? `data-wistia-src="${video.src}"`
                    : `src="${video.src}#t=${PREVIEW_TIME}"`}></video>
            <div class="play-overlay">
                <div class="play-btn">${SVGs.play}</div>
            </div>
            
            <div class="custom-controls">
                <div class="video-progress ${showTimeline}">
                    <div class="video-progress-filled"></div>
                </div>
                <div class="controls-buttons">
                    <div class="controls-left">
                        <button class="control-btn btn-play">${SVGs.play}</button>
                        <button class="control-btn btn-mute">${SVGs.unmute}</button>
                    </div>
                </div>
            </div>
        </div>`;

            card.innerHTML = `
        <div class="card-titlebar">
            <div class="window-dots">
                <span class="window-dot dot-close"></span>
                <span class="window-dot dot-min"></span>
                <span class="window-dot dot-max"></span>
            </div>
            <span class="card-title"></span>
        </div>
        ${mediaHTML}`;

            card.querySelector('.card-title').textContent = video.title;
            const mediaElement = card.querySelector('video, iframe');
            if (mediaElement) mediaElement.title = video.title;
            setupVideoInteractions(card);
            return card;
        }

        function setupVideoInteractions(card) {
            const video = card.querySelector('video');
            const youtubeFrame = card.querySelector('iframe[data-player-type="youtube"]');
            const wistiaFrame = card.querySelector('iframe[data-player-type="wistia"]');
            const playOverlay = card.querySelector('.play-overlay');
            const btnPlay = card.querySelector('.btn-play');
            const btnMute = card.querySelector('.btn-mute');
            const progress = card.querySelector('.video-progress');
            const progressFilled = card.querySelector('.video-progress-filled');

            if (youtubeFrame) {
                youtubeFrame.dataset.playing = 'false';
                ensureYouTubePlayer(youtubeFrame).catch(error => console.log('YouTube player init error:', error));

                const toggleYouTubePlay = () => {
                    ensureYouTubePlayer(youtubeFrame).then(player => {
                        const isPlaying = player.getPlayerState && player.getPlayerState() === window.YT.PlayerState.PLAYING;

                        if (isPlaying) {
                            player.pauseVideo();
                            return;
                        }

                        pauseOtherVideos(youtubeFrame);
                        player.playVideo();
                    }).catch(error => console.log('YouTube player toggle error:', error));
                };

                playOverlay.addEventListener('click', toggleYouTubePlay);
                btnPlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleYouTubePlay();
                });

                return;
            }

            if (wistiaFrame) {
                wistiaFrame.dataset.playing = 'false';
                ensureWistiaPlayer(wistiaFrame).catch(error => console.log('Wistia player init error:', error));

                const toggleWistiaPlay = () => {
                    ensureWistiaPlayer(wistiaFrame).then(player => {
                        const isPlaying = typeof player.state === 'function'
                            ? player.state() === 'playing'
                            : wistiaFrame.dataset.playing === 'true';

                        if (isPlaying) {
                            if (typeof player.pause === 'function') player.pause();
                            return;
                        }

                        pauseOtherVideos(wistiaFrame);
                        if (typeof player.play === 'function') player.play();
                    }).catch(error => console.log('Wistia player toggle error:', error));
                };

                playOverlay.addEventListener('click', toggleWistiaPlay);
                wistiaFrame.addEventListener('click', toggleWistiaPlay);
                btnPlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleWistiaPlay();
                });

                return;
            }

            video.muted = false;
            video.dataset.hasStarted = 'false';
            if (video.dataset.wistiaSrc) applyDefaultWistiaVideoVolume(video);

            if (video.dataset.wistiaSrc) {
                resolveWistiaThumbnailUrl(video.dataset.wistiaSrc).then(thumbUrl => {
                    if (thumbUrl && !video.getAttribute('poster')) {
                        video.poster = thumbUrl;
                    }
                }).catch(error => console.log('Wistia poster error:', error));

                ensureVideoSource(video).then(() => {
                    setPortfolioVideoPreview(video);
                }).catch(error => console.log('Wistia source error:', error));
            }

            const togglePlay = () => {
                if (video.paused) {
                    const sourceReady = video.dataset.wistiaSrc
                        ? ensureVideoSource(video)
                        : Promise.resolve(video.currentSrc || video.getAttribute('src') || '');

                    sourceReady.then(() => {
                        if (video.dataset.wistiaSrc) {
                            applyDefaultWistiaVideoVolume(video);
                        }

                        if (video.dataset.hasStarted !== 'true') {
                            try {
                                video.currentTime = 0;
                            } catch (_) { }
                            video.dataset.hasStarted = 'true';
                        }

                        pauseOtherVideos(video);
                        return video.play();
                    }).then(() => {
                        setVideoCardPlayingState(video, true);
                    }).catch(e => console.log('Playback error:', e));
                } else {
                    video.pause();
                    setVideoCardPlayingState(video, false);
                }
            };

            const toggleMute = (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                btnMute.innerHTML = video.muted ? SVGs.mute : SVGs.unmute;
            };

            playOverlay.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);
            btnPlay.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
            btnMute.addEventListener('click', toggleMute);

            video.addEventListener('timeupdate', () => {
                if (!video.duration) return;
                const percent = (video.currentTime / video.duration) * 100;
                progressFilled.style.width = `${percent}%`;
            });

            if (progress) {
                progress.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = progress.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    video.dataset.hasStarted = 'true';
                    video.currentTime = pos * video.duration;
                });
            }

            video.addEventListener('pause', () => {
                setVideoCardPlayingState(video, false);
            });
            video.addEventListener('play', () => {
                setVideoCardPlayingState(video, true);
            });

        }

        function openFolder(sectionId) {
            currentFolder = sectionId;
            pauseOtherVideos(null, true);

            const videos = getVideosForSection(sectionId);

            // Check if grid is mixed
            const allVertical = videos.every(v => v.aspect === 'vertical');
            const allHorizontal = videos.every(v => v.aspect === 'horizontal');

            const grid = document.getElementById('video-grid');
            grid.innerHTML = '';
            grid.className = 'video-grid';

            if (allVertical) {
                grid.classList.add('grid-vertical');
            } else if (allHorizontal) {
                grid.classList.add('grid-horizontal');
            } else {
                grid.classList.add('grid-mixed');
            }

            videos.forEach((video, i) => {
                grid.appendChild(createVideoCard(video, i));
            });

            document.getElementById('breadcrumb-title').textContent = SECTION_NAMES[sectionId];
            document.getElementById('folder-count').textContent = `${videos.length} ${videos.length === 1 ? 'item' : 'itens'}`;

            document.getElementById('intro-text').classList.add('hidden');
            document.getElementById('folder-grid').classList.add('hidden');
            document.getElementById('nav-bar').classList.add('active');
            document.getElementById('folder-content').classList.add('active');

            setTimeout(() => {
                document.getElementById('nav-bar').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        function closeFolder(event) {
            if (event) event.stopPropagation();

            currentFolder = null;
            pauseOtherVideos(null, true);
            document.getElementById('video-grid').innerHTML = '';

            document.getElementById('folder-content').classList.remove('active');
            document.getElementById('nav-bar').classList.remove('active');

            setTimeout(() => {
                document.getElementById('intro-text').classList.remove('hidden');
                document.getElementById('folder-grid').classList.remove('hidden');
            }, 200);

            setTimeout(() => {
                document.getElementById('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }

        /* ==========================================
           RAIN ANIMATION CANVAS
           ========================================== */
        function initRain() {
            const canvas = document.getElementById('rainCanvas');
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            const drops = [];
            const maxDrops = 150;

            for (let i = 0; i < maxDrops; i++) {
                drops.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    l: Math.random() * 20 + 10,
                    v: Math.random() * 4 + 4,
                    opacity: Math.random() * 0.15 + 0.05
                });
            }

            function draw() {
                ctx.clearRect(0, 0, width, height);
                ctx.lineCap = 'round';

                for (let i = 0; i < maxDrops; i++) {
                    const drop = drops[i];
                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x, drop.y + drop.l);
                    ctx.strokeStyle = `rgba(254, 206, 121, ${drop.opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    drop.y += drop.v;

                    // Re-spawn drop at top
                    if (drop.y > height) {
                        drop.y = -drop.l;
                        drop.x = Math.random() * width;
                    }
                }
                requestAnimationFrame(draw);
            }

            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            draw();
        }

        /* ==========================================
           3D MOTION BACKGROUND CANVAS
           ========================================== */
        function initMotionBg() {
            const canvas = document.getElementById('motionCanvas');
            const ctx = canvas.getContext('2d');
            let W = canvas.width = window.innerWidth;
            let H = canvas.height = window.innerHeight;
            const FL = 600; // focal length for perspective

            function rotX(point, angle) {
                const c = Math.cos(angle), s = Math.sin(angle);
                return [point[0], point[1] * c - point[2] * s, point[1] * s + point[2] * c];
            }

            function rotY(point, angle) {
                const c = Math.cos(angle), s = Math.sin(angle);
                return [point[0] * c + point[2] * s, point[1], -point[0] * s + point[2] * c];
            }

            function rotZ(point, angle) {
                const c = Math.cos(angle), s = Math.sin(angle);
                return [point[0] * c - point[1] * s, point[0] * s + point[1] * c, point[2]];
            }

            function project(point, shiftX, shiftY) {
                const z = point[2] + FL;
                const scale = FL / Math.max(z, 1);
                return {
                    x: shiftX + point[0] * scale,
                    y: shiftY + point[1] * scale,
                    s: scale
                };
            }

            function makeCube(size) {
                const s = size / 2;
                return {
                    verts: [
                        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
                        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
                    ],
                    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
                };
            }

            function makeRing() {
                const pts = [];
                for (let i = 0; i < 24; i++) {
                    const a = (i / 24) * Math.PI * 2;
                    pts.push([Math.cos(a) * 45, Math.sin(a) * 45, 0]);
                }
                const edges = [];
                for (let i = 0; i < 24; i++) edges.push([i, (i + 1) % 24]);
                return {
                    verts: pts,
                    edges
                };
            }

            function makePlayTriangle(size) {
                const s = size;
                return {
                    verts: [
                        [-s * 0.4, -s * 0.5, 0],
                        [-s * 0.4, s * 0.5, 0],
                        [s * 0.6, 0, 0]
                    ],
                    edges: [[0, 1], [1, 2], [2, 0]]
                };
            }

            function makeOctahedron(size) {
                const s = size;
                return {
                    verts: [
                        [0, -s, 0], [s, 0, 0], [0, 0, s],
                        [-s, 0, 0], [0, 0, -s], [0, s, 0]
                    ],
                    edges: [
                        [0, 1], [0, 2], [0, 3], [0, 4],
                        [5, 1], [5, 2], [5, 3], [5, 4],
                        [1, 2], [2, 3], [3, 4], [4, 1]
                    ]
                };
            }

            const shapes = [];
            const shapeTypes = [
                { make: () => makeCube(60), color: [254, 206, 121] },
                { make: () => makeRing(), color: [254, 180, 100] },
                { make: () => makeCube(40), color: [200, 140, 80] },
                { make: () => makePlayTriangle(50), color: [254, 206, 121] },
                { make: () => makeOctahedron(35), color: [254, 170, 90] },
                {
                    make: () => {
                        const pts = [];
                        for (let i = 0; i < 32; i++) {
                            const a = (i / 32) * Math.PI * 2;
                            pts.push([Math.cos(a) * 55, Math.sin(a) * 55, 0]);
                        }
                        const edges = [];
                        for (let i = 0; i < 32; i++) edges.push([i, (i + 1) % 32]);
                        return { verts: pts, edges };
                    }, color: [254, 206, 121]
                },
                { make: () => makePlayTriangle(35), color: [220, 160, 90] },
                { make: () => makeCube(50), color: [254, 190, 110] }
            ];

            for (let i = 0; i < shapeTypes.length; i++) {
                const t = shapeTypes[i];
                const shape = t.make();
                shapes.push({
                    ...shape,
                    cx: Math.random() * W,
                    cy: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.2,
                    rx: Math.random() * Math.PI * 2,
                    ry: Math.random() * Math.PI * 2,
                    rz: Math.random() * Math.PI * 2,
                    drx: (Math.random() - 0.5) * 0.008,
                    dry: (Math.random() - 0.5) * 0.008,
                    drz: (Math.random() - 0.5) * 0.004,
                    bobPhase: Math.random() * Math.PI * 2,
                    bobAmp: 15 + Math.random() * 25,
                    bobFreq: 0.005 + Math.random() * 0.008,
                    color: t.color,
                    alpha: 0.12 + Math.random() * 0.12,
                    parallaxDepth: 0.15 + Math.random() * 0.45
                });
            }

            let scrollY = 0;
            window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

            let time = 0;

            function drawMotion() {
                ctx.clearRect(0, 0, W, H);
                time++;

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                for (const shape of shapes) {
                    shape.rx += shape.drx;
                    shape.ry += shape.dry;
                    shape.rz += shape.drz;

                    shape.cx += shape.vx;
                    shape.cy += shape.vy;

                    const bob = Math.sin(time * shape.bobFreq + shape.bobPhase) * shape.bobAmp;
                    const cx = shape.cx;
                    const cy = shape.cy + bob - (scrollY * shape.parallaxDepth);

                    if (shape.cx < -120) shape.cx = W + 120;
                    if (shape.cx > W + 120) shape.cx = -120;
                    if (shape.cy < -120) shape.cy = H + 120;
                    if (shape.cy > H + 120) shape.cy = -120;

                    const projected = shape.verts.map(v => {
                        let p = rotX(v, shape.rx);
                        p = rotY(p, shape.ry);
                        p = rotZ(p, shape.rz);
                        return project(p, cx, cy);
                    });

                    const [r, g, b] = shape.color;
                    const a = shape.alpha;

                    ctx.globalCompositeOperation = 'lighter';
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.3})`;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${a * 0.4})`;
                    ctx.shadowBlur = 15;

                    ctx.beginPath();
                    for (const [i, j] of shape.edges) {
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                    }
                    ctx.stroke();

                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                    ctx.lineWidth = 1.2;

                    ctx.beginPath();
                    for (const [i, j] of shape.edges) {
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                    }
                    ctx.stroke();

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 1.2})`;
                    for (const pt of projected) {
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1.5 * pt.s, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.globalCompositeOperation = 'source-over';
                ctx.shadowBlur = 0;
                requestAnimationFrame(drawMotion);
            }

            window.addEventListener('resize', () => {
                W = canvas.width = window.innerWidth;
                H = canvas.height = window.innerHeight;
            });

            drawMotion();
        }

        function generateGrain() {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(256, 256);
            for (let i = 0; i < imgData.data.length; i += 4) {
                const v = Math.random() * 255;
                // make the grain grayscale
                imgData.data[i] = v; imgData.data[i + 1] = v; imgData.data[i + 2] = v; imgData.data[i + 3] = 15;
            }
            ctx.putImageData(imgData, 0, 0);
            return canvas.toDataURL('image/png');
        }

        function initScrollAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
            }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
            document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
        }

        function initBackToTop() {
            const btn = document.getElementById('back-to-top');
            window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > 300); });
        }

        function initKeyboard() {
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && currentFolder) closeFolder(); });
            document.querySelectorAll('.finder-item').forEach(item => {
                item.addEventListener('keydown', (e) => { if (e.key === 'Enter') item.click(); });
            });
        }

        function initLogoWordLoop(startDelay = 10000) {
            const target = document.getElementById('logo-dynamic-text');
            if (!target || target.dataset.loopStarted === 'true') return;

            target.dataset.loopStarted = 'true';

            const words = ['VIEIRA', 'EDITOR', 'DESIGN'];
            let wordIndex = 0;
            let charIndex = words[0].length;
            let isDeleting = false;

            const tick = () => {
                const currentWord = words[wordIndex];

                target.textContent = currentWord.slice(0, charIndex);

                let delay = isDeleting ? 88 : 136;

                if (!isDeleting && charIndex === currentWord.length) {
                    delay = 10000;
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    delay = 760;
                } else {
                    charIndex += isDeleting ? -1 : 1;
                }

                window.setTimeout(tick, delay);
            };

            window.setTimeout(() => {
                isDeleting = true;
                tick();
            }, startDelay);
        }

        function initSplash() {
            const splash = document.getElementById('splash-screen');
            const siteContent = document.getElementById('site-content');
            const splashName = splash ? splash.querySelector('.splash-name') : null;
            const splashSub = splash ? splash.querySelector('.splash-subtitle') : null;
            const logoContainer = document.querySelector('.logo-container');
            const logoCaret = document.querySelector('.logo-caret');
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isCompactSplash = window.matchMedia('(max-width: 768px)').matches;

            document.documentElement.classList.add('splash-active');
            document.body.classList.add('splash-active');

            if (!splash || !siteContent || !splashName || !logoContainer) {
                document.documentElement.classList.remove('splash-active');
                document.body.classList.remove('splash-active');
                if (logoCaret) logoCaret.classList.add('is-visible');
                initLogoWordLoop(10000);
                return;
            }

            // Hide real logo so splash text is the only one visible
            logoContainer.classList.add('invisible');

            // Pre-measure: temporarily make site visible (opacity:0) to get logo layout position
            // Since site-content has opacity:0 the user sees nothing but the DOM is laid out
            siteContent.style.visibility = 'hidden';
            siteContent.style.opacity = '0';
            siteContent.style.display = '';
            siteContent.classList.remove('hidden-for-splash');

            // Force layout recalc
            const logoRect = logoContainer.getBoundingClientRect();

            // Re-hide the site
            siteContent.classList.add('hidden-for-splash');
            siteContent.style.visibility = '';
            siteContent.style.opacity = '';

            const finishSplash = (cleanupDelay = 900) => {
                setTimeout(() => {
                    siteContent.classList.remove('hidden-for-splash');
                    siteContent.classList.add('reveal-from-splash');
                }, 120);

                setTimeout(() => {
                    logoContainer.classList.remove('invisible');
                    splash.remove();
                    siteContent.classList.remove('reveal-from-splash');
                    document.documentElement.classList.remove('splash-active');
                    document.body.classList.remove('splash-active');
                    window.setTimeout(() => {
                        if (logoCaret) logoCaret.classList.add('is-visible');
                    }, 240);
                    initLogoWordLoop(10000);
                }, cleanupDelay);
            };

            if (prefersReducedMotion || isCompactSplash) {
                setTimeout(() => {
                    if (splashSub) splashSub.classList.add('fade-out');
                    splash.classList.add('compact-exit');
                    finishSplash(780);
                }, isCompactSplash ? 1800 : 1400);
                return;
            }

            // After 2.5s, morph everything in one fluid shot
            setTimeout(() => {
                // Anchor on the first word "JESIEL" for pixel-perfect alignment
                const splashFirst = splashName.querySelector('.splash-first');
                const logoFirst = logoContainer.querySelector('.logo-text');
                const splashWordRect = splashFirst.getBoundingClientRect();
                const logoWordRect = logoFirst.getBoundingClientRect();

                // Align left edges and vertical centers of the first word
                const dx = logoWordRect.left - splashWordRect.left;
                const dy = (logoWordRect.top + logoWordRect.height / 2) - (splashWordRect.top + splashWordRect.height / 2);

                // 1) Immediately start text morph using Web Animations API
                splashName.animate([
                    { transform: 'translate(0, 0)', offset: 0 },
                    { transform: `translate(${dx}px, ${dy}px)`, offset: 1 }
                ], {
                    duration: 1100,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    fill: 'forwards'
                });

                // 2) Simultaneously fade subtitle, background, and reveal site
                if (splashSub) splashSub.classList.add('fade-out');
                splash.classList.add('morph');

                // 3) Show site content at 200ms so it appears behind the moving text
                setTimeout(() => {
                    siteContent.classList.remove('hidden-for-splash');
                    siteContent.classList.add('reveal-from-splash');
                }, 200);

                // 4) Clean up exactly when animation finishes
                finishSplash(1100);
            }, 2500);
        }

        /* ==========================================
           CUSTOM CURSOR
           ========================================== */
        function initCustomCursor() {
            const cursor = document.getElementById('custom-cursor');
            const cursorDot = document.getElementById('custom-cursor-dot');
            if (!cursor || !cursorDot) return;

            let mouseX = 0, mouseY = 0;
            let cursorX = 0, cursorY = 0;
            let dotX = 0, dotY = 0;
            let isVisible = false;

            // Smooth follow with lerp
            function animateCursor() {
                cursorX += (mouseX - cursorX) * 0.12;
                cursorY += (mouseY - cursorY) * 0.12;
                dotX += (mouseX - dotX) * 0.25;
                dotY += (mouseY - dotY) * 0.25;

                cursor.style.left = cursorX + 'px';
                cursor.style.top = cursorY + 'px';
                cursorDot.style.left = dotX + 'px';
                cursorDot.style.top = dotY + 'px';

                requestAnimationFrame(animateCursor);
            }

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (!isVisible) {
                    isVisible = true;
                    cursor.classList.add('visible');
                    cursorDot.classList.add('visible');
                }
            });

            document.addEventListener('mouseleave', () => {
                isVisible = false;
                cursor.classList.remove('visible');
                cursorDot.classList.remove('visible');
            });

            // Hover targets: folders, video cards, buttons
            const hoverTargets = '.finder-item, .video-card, .play-overlay, .nav-back, .tool-chip';

            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest(hoverTargets);
                if (target) {
                    cursor.classList.add('hovering');
                    cursorDot.classList.add('hovering');
                    if (target.classList.contains('finder-item')) {
                        cursor.classList.add('dark-mode');
                        cursorDot.classList.add('dark-mode');
                    }
                }
            });

            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest(hoverTargets);
                if (target) {
                    cursor.classList.remove('hovering');
                    cursorDot.classList.remove('hovering');
                    if (target.classList.contains('finder-item')) {
                        cursor.classList.remove('dark-mode');
                        cursorDot.classList.remove('dark-mode');
                    }
                }
            });

            animateCursor();
        }

        /* ==========================================
           SERVICES DATA & SVGS
           ========================================== */
        const svgMegaphone = `<svg viewBox="0 0 24 24"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>`;
        const svgBot = `<svg viewBox="0 0 24 24"><path d="M12 6V2H8"/><path d="M15 11v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M9 11v2"/></svg>`;
        const svgZap = `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
        const svgChart = `<svg viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`;
        const svgBook = `<svg viewBox="0 0 24 24"><path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/></svg>`;
        const svgPalette = `<svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
        const svgScissors = `<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`;
        const svgSmartphone = `<svg viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
        const svgType = `<svg viewBox="0 0 24 24"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>`;

        const svgSparkles = `<svg viewBox="0 0 24 24"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>`;
        const svgLayers = `<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
        const svgRotate = `<svg viewBox="0 0 24 24"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>`;
        const svgFilm = `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
        const svgMonitorPlay = `<svg viewBox="0 0 24 24"><path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"/><path d="M12 17v4"/><path d="M8 21h8"/><rect x="2" y="3" width="20" height="14" rx="2"/></svg>`;
        const svgClapperboard = `<svg viewBox="0 0 24 24"><path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/></svg>`;
        const svgWand = `<svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
        const svgMusic = `<svg viewBox="0 0 24 24"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>`;
        const svgWandSparkles = svgRotate;
        const svgPanelsTopLeft = svgWand;
        const svgCaptions = `<svg viewBox="0 0 24 24"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>`;

        const svgMic = `<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
        const svgYoutube = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"/></svg>`;
        const svgGraduation = `<svg viewBox="0 0 24 24"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`;
        const svgAdjust = `<svg viewBox="0 0 24 24"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>`;
        const svgEdit = `<svg viewBox="0 0 24 24"><path d="M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z"/><path d="M14.487 7.858A1 1 0 0 1 14 7V2"/><path d="M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516"/><path d="M8 18h1"/></svg>`;
        const svgMonitor = `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
        const svgRocket = `<svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`;

        const SERVICES_DATA = [
            {
                iconSvg: svgMegaphone,
                title: 'Criativos',
                bgImage: 'https://jesielpsd.wistia.com/medias/cwbs6k1xao',
                bgTint: '',
                subtitle: 'Vídeos curtos com alto impacto visual para redes sociais e campanhas.',
                services: [
                    { iconSvg: svgBot, text: 'Geração de áudio e vídeo com IA' },
                    { iconSvg: svgZap, text: 'Vídeos dinâmicos e ritmados' },
                    { iconSvg: svgChart, text: 'Vídeos com foco em vendas' },
                    { iconSvg: svgBook, text: 'Vídeos com foco na narrativa' },
                    { iconSvg: svgPalette, text: 'Design de thumbnails e capas' },
                    { iconSvg: svgScissors, text: 'Cortes estratégicos' },
                    { iconSvg: svgSmartphone, text: 'Multi-plataforma (Reels/TikTok)' },
                    { iconSvg: svgType, text: 'Legendas e motion text' },
                ],
                tags: ['SOCIAL MEDIA', 'PERFORMANCE', 'BRANDING']
            },
            {
                iconSvg: svgWandSparkles,
                title: 'Motions',
                bgImage: 'https://jesielpsd.wistia.com/medias/yjpzjk9fzk',
                bgTint: '',
                subtitle: 'Animações e motion graphics que elevam a identidade visual.',
                services: [
                    { iconSvg: svgLayers, text: 'Motion graphics para marcas' },
                    { iconSvg: svgRotate, text: 'Animação de logos e intros' },
                    { iconSvg: svgChart, text: 'Infográficos e data-viz' },
                    { iconSvg: svgFilm, text: 'Transições cinematográficas' },
                    { iconSvg: svgLayers, text: 'Lower thirds e overlays' },
                    { iconSvg: svgWand, text: 'Efeitos visuais e compositing' },
                    { iconSvg: svgMusic, text: 'Sync preciso de áudio' },
                    { iconSvg: svgEdit, text: 'Storyboard e concept de motion' },
                ],
                tags: ['AFTER EFFECTS', 'MOTION DESIGN', 'VFX']
            },
            {
                iconSvg: svgClapperboard,
                title: 'Vídeos Longos',
                bgImage: 'https://jesielpsd.wistia.com/medias/n1jnfrsbs6',
                bgTint: '',
                subtitle: 'Edição completa de vídeos longos para YouTube, podcasts e conteúdo educacional.',
                services: [
                    { iconSvg: svgMic, text: 'Edição de podcasts e entrevistas' },
                    { iconSvg: svgYoutube, text: 'Edição robusta para YouTube' },
                    { iconSvg: svgGraduation, text: 'Vídeos educacionais e tutoriais' },
                    { iconSvg: svgAdjust, text: 'Color grading pro' },
                    { iconSvg: svgMusic, text: 'Mixagem e design de áudio' },
                    { iconSvg: svgEdit, text: 'Estruturação de storytelling' },
                    { iconSvg: svgMonitor, text: 'Multicâmera e screen recording' },
                    { iconSvg: svgRocket, text: 'Otimização de retenção (SEO)' },
                ],
                tags: ['YOUTUBE', 'PODCAST', 'LONG FORM']
            }
        ];

        SERVICES_DATA[1].services[1].iconSvg = svgSparkles;
        SERVICES_DATA[1].services[3].iconSvg = svgClapperboard;
        SERVICES_DATA[1].services[4].iconSvg = svgPanelsTopLeft;
        SERVICES_DATA[1].services[5].iconSvg = svgWandSparkles;
        SERVICES_DATA[0].services[7].iconSvg = svgCaptions;
        SERVICES_DATA[2].services[6].iconSvg = svgMonitorPlay;

        const SECTION_ICON_META = {
            'criativos': {
                svg: svgMegaphone,
                tint: 'rgba(255, 163, 117, 0.34)',
                folderBase: '#B65B48',
                folderTab: '#F29969',
                folderLid: '#FFD2A6',
                titleColor: 'rgba(255, 241, 229, 0.96)',
                metaColor: 'rgba(255, 198, 162, 0.74)',
                glow: 'rgba(255, 140, 96, 0.22)',
                badgeHighlight: 'rgba(255, 170, 128, 0.34)'
            },
            'motions': {
                svg: svgWandSparkles,
                tint: 'rgba(120, 212, 255, 0.28)',
                folderBase: '#4D6884',
                folderTab: '#7FD0FF',
                folderLid: '#C8F0FF',
                titleColor: 'rgba(236, 250, 255, 0.96)',
                metaColor: 'rgba(177, 223, 243, 0.76)',
                glow: 'rgba(100, 200, 255, 0.2)',
                badgeHighlight: 'rgba(136, 214, 255, 0.34)'
            },
            'verticais': {
                svg: svgSmartphone,
                tint: 'rgba(255, 219, 168, 0.28)',
                folderBase: '#A96A46',
                folderTab: '#EDBC85',
                folderLid: '#FFE1B4',
                titleColor: 'rgba(255, 246, 232, 0.95)',
                metaColor: 'rgba(236, 206, 163, 0.74)',
                glow: 'rgba(240, 190, 112, 0.18)',
                badgeHighlight: 'rgba(255, 214, 158, 0.32)'
            },
            'horizontais': {
                svg: svgMonitorPlay,
                tint: 'rgba(150, 196, 255, 0.26)',
                folderBase: '#466280',
                folderTab: '#8FB9F5',
                folderLid: '#D7E7FF',
                titleColor: 'rgba(239, 246, 255, 0.96)',
                metaColor: 'rgba(180, 205, 242, 0.74)',
                glow: 'rgba(134, 176, 255, 0.18)',
                badgeHighlight: 'rgba(156, 196, 255, 0.32)'
            },
            'videos-longos': {
                svg: svgClapperboard,
                tint: 'rgba(255, 205, 122, 0.32)',
                folderBase: '#7B5C3E',
                folderTab: '#D9A763',
                folderLid: '#FFE3A8',
                titleColor: 'rgba(255, 246, 229, 0.96)',
                metaColor: 'rgba(236, 208, 165, 0.76)',
                glow: 'rgba(243, 186, 93, 0.18)',
                badgeHighlight: 'rgba(255, 208, 128, 0.34)'
            }
        };

        function initFinderSectionIcons() {
            document.querySelectorAll('.finder-item[data-section]').forEach(item => {
                const meta = SECTION_ICON_META[item.dataset.section];
                const iconWrap = item.querySelector('.finder-icon');
                if (!meta || !iconWrap) return;

                let badge = iconWrap.querySelector('.finder-icon-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'finder-icon-badge';
                    badge.setAttribute('aria-hidden', 'true');
                    iconWrap.appendChild(badge);
                }

                badge.style.setProperty('--badge-tint', meta.tint);
                badge.innerHTML = meta.svg;
                item.style.setProperty('--folder-base', meta.folderBase);
                item.style.setProperty('--folder-tab', meta.folderTab);
                item.style.setProperty('--folder-lid', meta.folderLid);
                item.style.setProperty('--finder-title-color', meta.titleColor);
                item.style.setProperty('--finder-meta-color', meta.metaColor);
                item.style.setProperty('--finder-accent-glow', meta.glow);
                item.style.setProperty('--finder-badge-highlight', meta.badgeHighlight);
            });
        }

        function initToolLoopIcons() {
            const TOOL_ICON_MAP = {
                'After Effects': {
                    chipStyle: '--tool-brand-rgb:207,150,253; --tool-brand-primary:#10051f; --tool-brand-secondary:#cf96fd;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-fill-primary brand-no-stroke" />
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-no-fill brand-stroke-secondary" stroke-width="3.5" />
                            <text x="15" y="41" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700" class="brand-fill-secondary brand-no-stroke">Ae</text>
                        </svg>
                    `
                },
                'Premiere Pro': {
                    chipStyle: '--tool-brand-rgb:153,153,255; --tool-brand-primary:#00005b; --tool-brand-secondary:#9999ff;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-fill-primary brand-no-stroke" />
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-no-fill brand-stroke-secondary" stroke-width="3.5" />
                            <text x="14" y="41" font-size="21" font-family="Inter, Arial, sans-serif" font-weight="700" class="brand-fill-secondary brand-no-stroke">Pr</text>
                        </svg>
                    `
                },
                'Photoshop': {
                    chipStyle: '--tool-brand-rgb:49,168,255; --tool-brand-primary:#001e36; --tool-brand-secondary:#31a8ff;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-fill-primary brand-no-stroke" />
                            <rect x="9" y="9" width="46" height="46" rx="10" class="brand-no-fill brand-stroke-secondary" stroke-width="3.5" />
                            <text x="15" y="41" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700" class="brand-fill-secondary brand-no-stroke">Ps</text>
                        </svg>
                    `
                },
                'CapCut': {
                    chipStyle: '--tool-brand-rgb:255,255,255; --tool-brand-primary:#f7f7f6; --tool-brand-secondary:#111111;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="12" class="brand-fill-primary brand-no-stroke" />
                            <path class="brand-fill-secondary brand-no-stroke" d="M16 20h16l9 7h8v4H39L24 44H16l14-13L16 20zm32 0L35 31l13 13h-6L29 31l13-11h6z" />
                        </svg>
                    `
                },
                'FL Studio': {
                    chipStyle: '--tool-brand-rgb:245,138,31; --tool-brand-primary:#f58a1f; --tool-brand-secondary:#8bc34a;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <path class="brand-fill-secondary brand-no-stroke" d="M38 12c5-5 11-6 16-3-3 6-9 10-17 10 1-2 1-5 1-7z" />
                            <path class="brand-fill-primary brand-no-stroke" d="M38 18c-8-1-15 1-21 7-7 7-9 19-5 28 4 8 12 12 22 10 11-2 18-9 21-19 3-10-1-20-9-24-2-1-5-2-8-2zm-9 10c4-4 9-6 14-5 7 1 12 6 13 13 1 8-4 16-12 20-6 2-12 1-16-3-5-5-6-13-2-20 1-2 2-4 3-5z" />
                        </svg>
                    `
                },
                'Figma': {
                    chipStyle: '--tool-brand-rgb:162,89,255; --tool-brand-primary:#f24e1e; --tool-brand-secondary:#ff7262; --tool-brand-tertiary:#0acf83; --tool-brand-quaternary:#a259ff; --tool-brand-quinary:#1abcfe;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="18" y="9" width="14" height="14" rx="7" class="brand-fill-primary brand-no-stroke" />
                            <rect x="18" y="23" width="14" height="14" rx="7" class="brand-fill-secondary brand-no-stroke" />
                            <rect x="18" y="37" width="14" height="14" rx="7" class="brand-fill-tertiary brand-no-stroke" />
                            <rect x="32" y="9" width="14" height="14" rx="7" class="brand-fill-quaternary brand-no-stroke" />
                            <rect x="32" y="23" width="14" height="14" rx="7" class="brand-fill-quinary brand-no-stroke" />
                        </svg>
                    `
                },
                'VS Code': {
                    chipStyle: '--tool-brand-rgb:34,166,242; --tool-brand-primary:#29b6f6; --tool-brand-secondary:#007acc; --tool-brand-tertiary:#9cdcfe;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <path class="brand-fill-secondary brand-no-stroke" d="M47 11 24 28l-9-5v18l9-5 23 17 4-2V13l-4-2z" />
                            <path class="brand-fill-primary brand-no-stroke" d="M24 28 47 11v42L24 36V28z" />
                            <path class="brand-no-fill brand-stroke-tertiary" d="M24 28 47 11v42L24 36V28z" stroke-width="3" stroke-linejoin="round" />
                        </svg>
                    `
                },
                'Antigravity': {
                    chipStyle: '--tool-brand-rgb:255,255,255; --tool-brand-primary:#f4f2ec; --tool-brand-secondary:#0c0c0c;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="12" class="brand-fill-secondary brand-no-stroke" />
                            <path class="brand-fill-primary brand-no-stroke" d="M32 15 48 49h-8l-2.8-6H26.8L24 49h-8L32 15zm-2.5 21h5L32 31l-2.5 5zm13-4 4.5-10H39l-4.5 10h8z" />
                        </svg>
                    `
                },
                'Cursor': {
                    chipStyle: '--tool-brand-rgb:255,255,255; --tool-brand-primary:#f8f8f7; --tool-brand-secondary:#111111;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <rect x="9" y="9" width="46" height="46" rx="12" class="brand-fill-primary brand-no-stroke" />
                            <path class="brand-fill-secondary brand-no-stroke" d="M18 18h15l8 9-8 9H18l7-9-7-9zm16 9h14l-7 9H27l7-9zm0 0-7 9 7 9h14l-7-9 7-9H34z" />
                        </svg>
                    `
                },
                'ChatGPT': {
                    chipStyle: '--tool-brand-rgb:16,163,127; --tool-brand-primary:#10a37f;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <g class="brand-no-fill brand-stroke-primary" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M32 12c4.8 0 8.8 4 8.8 8.8v5.7L32 31l-8.8-4.5v-5.7C23.2 16 27.2 12 32 12z" />
                                <path d="M47.3 20.8c4.2 2.4 5.7 7.8 3.2 12l-2.8 5-10 .1v-10l9.6-5.1z" />
                                <path d="M47.2 43.2c0 4.8-4 8.8-8.8 8.8h-5.7L28.2 43l4.5-8.8h5.7c4.8 0 8.8 4 8.8 8.8z" />
                                <path d="M32 52c-4.8 0-8.8-4-8.8-8.8v-5.7L32 33l8.8 4.5v5.7c0 4.8-4 8.8-8.8 8.8z" />
                                <path d="M16.7 43.2c-4.2-2.4-5.7-7.8-3.2-12l2.8-5 10-.1v10l-9.6 5.1z" />
                                <path d="M16.8 20.8c0-4.8 4-8.8 8.8-8.8h5.7L35.8 21l-4.5 8.8h-5.7c-4.8 0-8.8-4-8.8-8.8z" />
                            </g>
                        </svg>
                    `
                },
                'Gemini': {
                    chipStyle: '--tool-brand-rgb:122,138,255; --tool-brand-primary:#6ea8ff; --tool-brand-secondary:#9b6dff;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <path class="brand-fill-primary brand-no-stroke" d="M32 10c3 11 11 19 22 22-11 3-19 11-22 22-3-11-11-19-22-22 11-3 19-11 22-22z" />
                            <path class="brand-fill-secondary brand-no-stroke" d="M46 18c1.6 5.2 4.8 8.4 10 10-5.2 1.6-8.4 4.8-10 10-1.6-5.2-4.8-8.4-10-10 5.2-1.6 8.4-4.8 10-10z" />
                        </svg>
                    `
                },
                'Flow': {
                    chipStyle: '--tool-brand-rgb:66,133,244; --tool-brand-primary:#4285f4; --tool-brand-secondary:#ea4335; --tool-brand-tertiary:#fbbc05; --tool-brand-quaternary:#34a853;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <path class="brand-fill-primary brand-no-stroke" d="M32 12c7 0 13 2 18 7l-6.5 6.5C40.3 22.7 36.6 21 32 21V12z" />
                            <path class="brand-fill-secondary brand-no-stroke" d="M52 32c0 7-2 13-7 18l-6.5-6.5C41.3 40.3 43 36.6 43 32h9z" />
                            <path class="brand-fill-tertiary brand-no-stroke" d="M32 52c-7 0-13-2-18-7l6.5-6.5C23.7 41.3 27.4 43 32 43v9z" />
                            <path class="brand-fill-quaternary brand-no-stroke" d="M12 32c0-7 2-13 7-18l6.5 6.5C22.7 23.7 21 27.4 21 32h-9z" />
                        </svg>
                    `
                },
                'Claude': {
                    chipStyle: '--tool-brand-rgb:217,119,87; --tool-brand-primary:#d97757; --tool-brand-secondary:#f4d4b2;',
                    svg: `
                        <svg viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="5.5" class="brand-fill-secondary brand-no-stroke" />
                            <path d="M32 14v9M32 41v9M14 32h9M41 32h9M19 19l6.5 6.5M38.5 38.5 45 45M45 19l-6.5 6.5M25.5 38.5 19 45" class="brand-no-fill brand-stroke-primary" stroke-width="4" stroke-linecap="round" />
                        </svg>
                    `
                }
            };

            document.querySelectorAll('.tool-chip').forEach(chip => {
                const name = chip.querySelector('.tool-name')?.textContent.trim();
                const logo = chip.querySelector('.tool-logo');
                const config = TOOL_ICON_MAP[name];

                if (!config || !logo) return;

                chip.classList.add('tool-chip-branded');
                chip.style.cssText = config.chipStyle;
                logo.style.cssText = '';
                logo.innerHTML = config.svg.trim();
            });
        }

        function initToolsMarquee() {
            const marquee = document.querySelector('.tools-marquee');
            const tracks = marquee ? Array.from(marquee.querySelectorAll('.tools-track')) : [];
            const firstTrack = tracks[0];
            const secondTrack = tracks[1];
            if (!marquee || !firstTrack || !secondTrack) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                marquee.style.animation = 'none';
                marquee.style.transform = 'translate3d(0, 0, 0)';
                return;
            }

            const speed = 38;
            secondTrack.innerHTML = firstTrack.innerHTML;

            const recalc = () => {
                const gap = parseFloat(window.getComputedStyle(marquee).gap) || 0;
                const distance = Math.max(firstTrack.scrollWidth + gap, 1);
                const duration = distance / speed;
                marquee.style.setProperty('--tools-loop-distance', `${distance}px`);
                marquee.style.setProperty('--tools-loop-duration', `${duration}s`);
                marquee.style.animation = 'none';
                void marquee.offsetWidth;
                marquee.style.animation = '';
            };

            recalc();
            window.addEventListener('resize', recalc, { passive: true });
        }

        function initServices() {
            const grid = document.getElementById('services-grid');
            if (!grid) return;

            grid.innerHTML = SERVICES_DATA.map((card, index) => `
                <div class="service-card" data-bg="${card.bgImage}" data-tint="${card.bgTint}">
                    <div class="service-card-header">
                        <div class="service-card-icon-circle service-card-emoji">
                            ${card.iconSvg}
                        </div>
                        <div class="service-card-title-group">
                            <h3 class="service-card-title">${card.title}</h3>
                            <p class="service-card-subtitle">${card.subtitle}</p>
                        </div>
                    </div>
                    
                    <div class="service-card-divider"></div>
                    
                    <ul class="service-list">
                        ${card.services.map(s => `
                            <li>
                                <span class="service-pill-icon" aria-hidden="true">${s.iconSvg}</span>
                                <span>${s.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div class="service-tags">
                        ${card.tags.map(t => `<span class="service-tag">${t}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            // Build global background layers and attach interactions
            const bgContainer = document.getElementById('global-editor-bg-container');
            if (bgContainer) {
                // Generate the crossfade layers
                bgContainer.innerHTML = SERVICES_DATA.map((card, idx) => `
                    <div class="global-editor-layer" id="bg-layer-${idx}" style="background-image: url('${card.bgImage}')"></div>
                `).join('');

                SERVICES_DATA.forEach((card, idx) => {
                    if (!getWistiaMediaId(card.bgImage)) return;

                    fetch(`https://fast.wistia.net/oembed?url=${encodeURIComponent(card.bgImage)}`)
                        .then(res => res.json())
                        .then(data => {
                            const bgUrl = data?.thumbnail_url || data?.url;
                            if (!bgUrl) return;
                            const layer = document.getElementById(`bg-layer-${idx}`);
                            if (layer) {
                                layer.style.backgroundImage = `url('${bgUrl}')`;
                            }
                        })
                        .catch(error => console.error('Error fetching Wistia service bg:', error));
                });

                document.querySelectorAll('.service-card').forEach((card, idx) => {
                    card.addEventListener('mouseenter', () => {
                        // Deactivate all layers
                        document.querySelectorAll('.global-editor-layer').forEach(layer => layer.classList.remove('active'));

                        // Activate the matching layer
                        const activeLayer = document.getElementById(`bg-layer-${idx}`);
                        if (activeLayer) {
                            activeLayer.classList.add('active');
                        }
                    });

                    card.addEventListener('mouseleave', () => {
                        const activeLayer = document.getElementById(`bg-layer-${idx}`);
                        if (activeLayer) {
                            activeLayer.classList.remove('active');
                        }
                    });
                });
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            initSplash();
            initRain();
            initMotionBg();
            initCustomCursor();
            initToolLoopIcons();
            initToolsMarquee();
            initServices();
            initFinderSectionIcons();
            document.getElementById('grain-overlay').style.backgroundImage = `url(${generateGrain()})`;
            initFolderMeta();
            initScrollAnimations();
            initBackToTop();
            initKeyboard();
            initAboutSection();
        });

        /* ==========================================
           ABOUT SECTION - SFX PLAYERS & SCROLL REVEAL
           ========================================== */
        function initAboutSection() {
            const aboutCards = document.querySelectorAll('.about-card');
            if (aboutCards.length === 0) return;

            const aboutObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        aboutObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

            aboutCards.forEach(card => aboutObserver.observe(card));

            const overlayVideo = document.getElementById('overlay-video');
            const transitionVideos = Array.from(document.querySelectorAll('.transition-video'));

            function primeTransitionVideo(video) {
                if (!video) return;
                video.muted = true;
                video.volume = 0;
                video.pause();
                try {
                    video.currentTime = 0.08;
                } catch (_) { }
            }

            if (overlayVideo) {
                ensureVideoSource(overlayVideo).then(() => {
                    overlayVideo.play().catch(() => { });
                });
            }

            document.querySelectorAll('img[data-wistia-thumb]').forEach(img => {
                const wistiaSrc = img.dataset.wistiaThumb;
                if (!wistiaSrc) return;

                resolveWistiaThumbnailUrl(wistiaSrc).then(thumbUrl => {
                    if (thumbUrl) {
                        img.src = thumbUrl;
                    }
                });
            });

            transitionVideos.forEach(video => {
                ensureVideoSource(video).then(() => {
                    if (video.readyState >= 2) {
                        primeTransitionVideo(video);
                    } else {
                        video.addEventListener('loadeddata', () => primeTransitionVideo(video), { once: true });
                    }
                });
            });

            let currentTransitionVideo = null;

            function muteTransitionVideo(video) {
                if (!video) return;
                video.pause();
                try {
                    video.currentTime = 0.08;
                } catch (_) { }
                video.muted = true;
                video.volume = 0;
                const preview = video.closest('.transition-preview');
                if (preview) preview.classList.remove('with-sound');
            }

            const unlockHoverMedia = () => {
                transitionVideos.forEach(video => {
                    ensureVideoSource(video).then(() => {
                        video.muted = true;
                        video.volume = 0;
                        video.play()
                            .then(() => {
                                video.pause();
                                try {
                                    video.currentTime = 0.08;
                                } catch (_) { }
                            })
                            .catch(() => { });
                    });
                });
            };

            document.addEventListener('pointerdown', unlockHoverMedia, { once: true });

            document.querySelectorAll('.transition-preview').forEach(preview => {
                const video = preview.querySelector('.transition-video');
                if (!video) return;

                preview.addEventListener('mouseenter', async () => {
                    await ensureVideoSource(video);

                    if (currentTransitionVideo && currentTransitionVideo !== video) {
                        muteTransitionVideo(currentTransitionVideo);
                    }

                    preview.classList.add('with-sound');
                    currentTransitionVideo = video;
                    try {
                        video.currentTime = 0;
                    } catch (_) { }
                    video.muted = false;
                    applyDefaultWistiaVideoVolume(video);
                    video.play().catch(() => {
                        console.log('Hover sound blocked by browser until user interaction.');
                        video.muted = true;
                        video.volume = 0;
                        video.play().catch(() => { });
                    });
                });

                preview.addEventListener('mouseleave', () => {
                    muteTransitionVideo(video);
                    if (currentTransitionVideo === video) currentTransitionVideo = null;
                });
            });

            let currentAudio = null;
            let currentItem = null;
            let animFrame = null;

            document.querySelectorAll('.sfx-item').forEach(item => {
                const src = item.dataset.src;
                const playBtn = item.querySelector('.sfx-play-btn');
                const waveFill = item.querySelector('.sfx-wave-fill');
                let audio = null;
                let audioPromise = null;

                const playIcon = '<svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
                const pauseIcon = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="2"/><rect x="14" y="5" width="4" height="14" rx="2"/></svg>';

                async function ensureAudio() {
                    if (audio) return audio;
                    if (audioPromise) return audioPromise;

                    audioPromise = (async () => {
                        const resolvedSrc = getWistiaMediaId(src)
                            ? await resolveWistiaPlayableUrl(src, 'audio')
                            : src;

                        if (!resolvedSrc) return null;

                        audio = new Audio(resolvedSrc);
                        audio.preload = 'auto';
                        applyDefaultWistiaAudioVolume(audio);
                        audio.addEventListener('ended', () => {
                            item.classList.remove('playing');
                            playBtn.innerHTML = playIcon;
                            waveFill.style.width = '0%';

                            if (currentAudio === audio) {
                                currentAudio = null;
                                currentItem = null;
                            }

                            if (animFrame) cancelAnimationFrame(animFrame);
                        });

                        return audio;
                    })().catch(error => {
                        console.error('Error preparing SFX audio:', src, error);
                        return null;
                    });

                    return audioPromise;
                }

                function stopCurrent() {
                    if (currentAudio && currentAudio !== audio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                        if (currentItem) {
                            currentItem.classList.remove('playing');
                            currentItem.querySelector('.sfx-play-btn').innerHTML = playIcon;
                            currentItem.querySelector('.sfx-wave-fill').style.width = '0%';
                        }
                    }
                    if (animFrame) cancelAnimationFrame(animFrame);
                }

                function updateProgress() {
                    if (!audio || audio.paused) return;
                    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                    waveFill.style.width = pct + '%';
                    animFrame = requestAnimationFrame(updateProgress);
                }

                item.addEventListener('mouseenter', async () => {
                    const resolvedAudio = await ensureAudio();
                    if (!resolvedAudio) return;

                    if (currentAudio === resolvedAudio && !resolvedAudio.paused) {
                        return;
                    }

                    stopCurrent();

                    try {
                        resolvedAudio.currentTime = 0;
                    } catch (_) { }

                    resolvedAudio.play().then(() => {
                        item.classList.add('playing');
                        playBtn.innerHTML = pauseIcon;
                        currentAudio = resolvedAudio;
                        currentItem = item;
                        updateProgress();
                    }).catch(e => {
                        console.log('Hover auto-play blocked by browser. User must interact first.', e);
                    });
                });
            });

            window.addEventListener('blur', () => {
                if (currentTransitionVideo) {
                    muteTransitionVideo(currentTransitionVideo);
                    currentTransitionVideo = null;
                }

                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                if (currentItem) {
                    currentItem.classList.remove('playing');
                    currentItem.querySelector('.sfx-play-btn').innerHTML = '<svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
                    currentItem.querySelector('.sfx-wave-fill').style.width = '0%';
                }

                currentAudio = null;
                currentItem = null;
                if (animFrame) cancelAnimationFrame(animFrame);
            });
        }

        /* ==========================================
           TEXT FILE POPUPS CONTROLS
           ========================================== */
        function openTextFile(id) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden'; // prevent scrolling
            document.getElementById('popup-overlay').classList.add('active');
            const popup = document.getElementById('popup-' + id);
            if (popup) popup.classList.add('active');
        }

        function closeAllTextFiles() {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.getElementById('popup-overlay').classList.remove('active');
            document.querySelectorAll('.popup-text-file').forEach(el => {
                el.classList.remove('active');
            });
        }
