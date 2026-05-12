function inlineVideoPlayer(url){
return `
        <media-container class="media-minimal-skin media-minimal-skin--video">
            <video src="/cdn/media/${url}" playsinline></video>

            <media-buffering-indicator class="media-buffering-indicator">
                <svg class="media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1"><animate attributeName="opacity" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="12.243" y="2.257" opacity=".45" rx="1" transform="rotate(45 13.243 4.757)"><animate attributeName="opacity" begin="0.125s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1"><animate attributeName="opacity" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="10.743" y="12.243" opacity=".35" rx="1" transform="rotate(45 13.243 13.243)"><animate attributeName="opacity" begin="0.375s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1"><animate attributeName="opacity" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="3.757" y="10.743" opacity=".25" rx="1" transform="rotate(45 4.757 13.243)"><animate attributeName="opacity" begin="0.625s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1"><animate attributeName="opacity" begin="0.75s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="2.257" y="3.757" opacity=".1" rx="1" transform="rotate(45 4.757 4.757)"><animate attributeName="opacity" begin="0.875s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect></svg>
            </media-buffering-indicator>

            <media-error-dialog class="media-error">
                <div class="media-error__dialog">
                    <div class="media-error__content">
                    <media-alert-dialog-title class="media-error__title">Something went wrong.</media-alert-dialog-title>
                    <media-alert-dialog-description class="media-error__description"></media-alert-dialog-description>
                    </div>
                    <div class="media-error__actions">
                    <media-alert-dialog-close class="media-button media-button--primary">OK</media-alert-dialog-close>
                    </div>
                </div>
            </media-error-dialog>

            <media-controls class="media-controls">
            <media-tooltip-group>
                <div class="media-button-group">
                    <media-play-button commandfor="play-tooltip" class="media-button media-button--subtle media-button--icon media-button--play">
                        <svg class="media-icon media-icon--restart" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M9 17a8 8 0 0 1-8-8h1.5a6.5 6.5 0 1 0 1.43-4.07l1.643 1.643A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"/><path fill="currentColor" d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"/></svg>
                        <svg class="media-icon media-icon--play" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="m13.473 10.476-6.845 4.256a1.697 1.697 0 0 1-2.364-.547 1.77 1.77 0 0 1-.264-.93v-8.51C4 3.78 4.768 3 5.714 3c.324 0 .64.093.914.268l6.845 4.255a1.763 1.763 0 0 1 0 2.953"/></svg>
                        <svg class="media-icon media-icon--pause" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="4" height="12" x="3" y="3" fill="currentColor" rx="1.75"/><rect width="4" height="12" x="11" y="3" fill="currentColor" rx="1.75"/></svg>
                    </media-play-button>
                    <media-tooltip id="play-tooltip" side="top" class="media-tooltip"></media-tooltip>
                </div>

                <div class="media-time-controls">
                    <media-time-group class="media-time-group">
                        <media-time type="current" class="media-time media-time--current"></media-time>
                        <media-time-separator class="media-time-separator"></media-time-separator>
                        <media-time type="duration" class="media-time media-time--duration"></media-time>
                    </media-time-group>
                

                    <media-time-slider class="media-slider">
                        <media-slider-track class="media-slider__track">
                        <media-slider-fill class="media-slider__fill"></media-slider-fill>
                        <media-slider-buffer class="media-slider__buffer"></media-slider-buffer>
                        </media-slider-track>
                        <media-slider-thumb class="media-slider__thumb"></media-slider-thumb>

                        <div class="media-preview media-slider__preview">
                        <div class="media-preview__thumbnail-wrapper">
                            <media-slider-thumbnail class="media-preview__thumbnail"></media-slider-thumbnail>
                        </div>
                        <media-slider-value type="pointer" class="media-time media-preview__time"></media-slider-value>
                        <svg class="media-preview__spinner media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1"><animate attributeName="opacity" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="12.243" y="2.257" opacity=".45" rx="1" transform="rotate(45 13.243 4.757)"><animate attributeName="opacity" begin="0.125s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1"><animate attributeName="opacity" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="10.743" y="12.243" opacity=".35" rx="1" transform="rotate(45 13.243 13.243)"><animate attributeName="opacity" begin="0.375s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1"><animate attributeName="opacity" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="3.757" y="10.743" opacity=".25" rx="1" transform="rotate(45 4.757 13.243)"><animate attributeName="opacity" begin="0.625s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1"><animate attributeName="opacity" begin="0.75s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="2.257" y="3.757" opacity=".1" rx="1" transform="rotate(45 4.757 4.757)"><animate attributeName="opacity" begin="0.875s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect></svg>
                        </div>
                    </media-time-slider>
                </div>

                <div class="media-button-group">
                    <media-mute-button commandfor="video-volume-popover" class="media-button media-button--subtle media-button--icon media-button--mute">
                        <svg class="media-icon media-icon--volume-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"/></svg>
                        <svg class="media-icon media-icon--volume-low" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>
                        <svg class="media-icon media-icon--volume-high" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"/><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>
                    </media-mute-button>

                    <media-popover id="video-volume-popover" open-on-hover delay="200" close-delay="100" side="top" class="media-popover media-popover--volume">
                        <media-volume-slider class="media-slider" orientation="vertical" thumb-alignment="edge">
                        <media-slider-track class="media-slider__track">
                            <media-slider-fill class="media-slider__fill"></media-slider-fill>
                        </media-slider-track>
                        <media-slider-thumb class="media-slider__thumb media-slider__thumb--persistent"></media-slider-thumb>
                        </media-volume-slider>
                    </media-popover>

                    <media-captions-button commandfor="captions-tooltip" class="media-button media-button--subtle media-button--icon media-button--captions">
                        <svg class="media-icon media-icon--captions-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="16.5" height="12.5" x=".75" y="2.75" stroke="currentColor" stroke-width="1.5" rx="3"/><rect width="3" height="1.5" x="3" y="8.5" fill="currentColor" rx=".75"/><rect width="2" height="1.5" x="13" y="8.5" fill="currentColor" rx=".75"/><rect width="4" height="1.5" x="11" y="11.5" fill="currentColor" rx=".75"/><rect width="5" height="1.5" x="7" y="8.5" fill="currentColor" rx=".75"/><rect width="7" height="1.5" x="3" y="11.5" fill="currentColor" rx=".75"/></svg>
                        <svg class="media-icon media-icon--captions-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15 2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM3.75 11.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm8 0a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-8-3a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5zm4 0a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5zm6 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5z"/></svg>
                    </media-captions-button>
                    <media-tooltip id="captions-tooltip" side="top" class="media-tooltip">
                        Toggle captions
                    </media-tooltip>

                    <media-cast-button commandfor="cast-tooltip" class="media-button media-button--subtle media-button--icon media-button--cast">
                        <svg class="media-icon media-icon--cast-enter" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.75 13.5v2.25H3A2.23 2.23 0 0 0 .75 13.5m0-3V12c2.07 0 3.75 1.65 3.75 3.75H6A5.246 5.246 0 0 0 .75 10.5"/><path fill="currentColor" d="M.75 7.5V9c3.728 0 6.75 3 6.75 6.75H9A8.25 8.25 0 0 0 .75 7.5"/><path fill="currentColor" d="M15.75 2.25H2.25c-.825 0-1.5.675-1.5 1.5V6h1.5V3.75h13.5v10.5H10.5v1.5h5.25c.825 0 1.5-.675 1.5-1.5V3.75c0-.825-.675-1.5-1.5-1.5"/></svg>
                        <svg class="media-icon media-icon--cast-exit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.75 13.5v2.25H3A2.23 2.23 0 0 0 .75 13.5m0-3V12c2.07 0 3.75 1.65 3.75 3.75H6A5.246 5.246 0 0 0 .75 10.5"/><path fill="currentColor" d="M.75 7.5V9c3.728 0 6.75 3 6.75 6.75H9A8.25 8.25 0 0 0 .75 7.5"/><path fill="currentColor" d="M15.75 2.25H2.25c-.825 0-1.5.675-1.5 1.5V6h1.5V3.75h13.5v10.5H10.5v1.5h5.25c.825 0 1.5-.675 1.5-1.5V3.75c0-.825-.675-1.5-1.5-1.5"/><path fill="currentColor" d="M3.75 5.25v1.223C6 6.45 10.028 10.5 10.028 12.75h4.222v-7.5z"/></svg>
                    </media-cast-button>
                    <media-tooltip id="cast-tooltip" side="top" class="media-tooltip"></media-tooltip>

                    <media-pip-button commandfor="pip-tooltip" class="media-button media-button--subtle media-button--icon media-button--pip">
                        <svg class="media-icon media-icon--pip-enter" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M13 2a4 4 0 0 1 4 4v2.645a3.5 3.5 0 0 0-1-.145h-.5V6A2.5 2.5 0 0 0 13 3.5H4A2.5 2.5 0 0 0 1.5 6v6A2.5 2.5 0 0 0 4 14.5h2.5v.5c0 .347.05.683.145 1H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2"/><path fill="currentColor" d="M7.25 10A.75.75 0 0 0 8 9.25v-3.5a.75.75 0 0 0-1.5 0V8.5H3.75a.75.75 0 0 0-.743.648L3 9.25c0 .414.336.75.75.75z"/><path fill="currentColor" d="M6.72 9.78a.75.75 0 0 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 1.06z"/></svg>
                        <svg class="media-icon media-icon--pip-exit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M13 2a4 4 0 0 1 4 4v2.646a3.5 3.5 0 0 0-1-.146h-.5V6A2.5 2.5 0 0 0 13 3.5H4A2.5 2.5 0 0 0 1.5 6v6A2.5 2.5 0 0 0 4 14.5h2.5v.5q.002.523.146 1H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2"/><path fill="currentColor" d="M3.75 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V6.5h2.75a.75.75 0 0 0 .743-.648L8 5.75A.75.75 0 0 0 7.25 5z"/><path fill="currentColor" d="M4.28 5.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06-1.06z"/></svg>
                    </media-pip-button>
                    <media-tooltip id="pip-tooltip" side="top" class="media-tooltip"></media-tooltip>

                    <media-fullscreen-button commandfor="fullscreen-tooltip" class="media-button media-button--subtle media-button--icon media-button--fullscreen">
                        <svg class="media-icon media-icon--fullscreen-enter" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15.25 2a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3.5h-3.75a.75.75 0 0 1-.743-.648L10 2.75a.75.75 0 0 1 .75-.75z"/><path fill="currentColor" d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM2.75 10a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 .743.648L8 15.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"/><path fill="currentColor" d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"/></svg>
                        <svg class="media-icon media-icon--fullscreen-exit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M10.75 2a.75.75 0 0 1 .75.75V6.5h3.75a.75.75 0 0 1 .743.648L16 7.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"/><path fill="currentColor" d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM7.25 10a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V11.5H2.75a.75.75 0 0 1-.743-.648L2 10.75a.75.75 0 0 1 .75-.75z"/><path fill="currentColor" d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"/></svg>
                    </media-fullscreen-button>
                    <media-tooltip id="fullscreen-tooltip" side="top" class="media-tooltip"></media-tooltip>
                </div>
            </media-tooltip-group>
            </media-controls>

            <div class="media-overlay"></div>
            
            <!-- Hotkeys -->
            <media-hotkey keys="Space" action="togglePaused"></media-hotkey>
            <media-hotkey keys="k" action="togglePaused"></media-hotkey>
            <media-hotkey keys="m" action="toggleMuted"></media-hotkey>
            <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
            <media-hotkey keys="c" action="toggleSubtitles"></media-hotkey>
            <media-hotkey keys="i" action="togglePictureInPicture"></media-hotkey>
            <media-hotkey keys="ArrowRight" action="seekStep" value="5"></media-hotkey>
            <media-hotkey keys="ArrowLeft" action="seekStep" value="-5"></media-hotkey>
            <media-hotkey keys="l" action="seekStep" value="10"></media-hotkey>
            <media-hotkey keys="j" action="seekStep" value="-10"></media-hotkey>
            <media-hotkey keys="ArrowUp" action="volumeStep" value="0.05"></media-hotkey>
            <media-hotkey keys="ArrowDown" action="volumeStep" value="-0.05"></media-hotkey>
            <media-hotkey keys="0-9" action="seekToPercent"></media-hotkey>
            <media-hotkey keys="Home" action="seekToPercent" value="0"></media-hotkey>
            <media-hotkey keys="End" action="seekToPercent" value="100"></media-hotkey>
            <media-hotkey keys=">" action="speedUp"></media-hotkey>
            <media-hotkey keys="<" action="speedDown"></media-hotkey>

            <!-- Gestures -->
            <media-gesture type="tap" action="togglePaused" pointer="mouse" region="center"></media-gesture>
            <media-gesture type="tap" action="toggleControls" pointer="touch"></media-gesture>
            <media-gesture type="doubletap" action="seekStep" value="-10" region="left"></media-gesture>
            <media-gesture type="doubletap" action="toggleFullscreen" region="center"></media-gesture>
            <media-gesture type="doubletap" action="seekStep" value="10" region="right"></media-gesture>
        </media-container>
    `
};