/* =========================================================
   GAME PAGE TEMPLATE — gallery + scroll reveal
   Gallery items are read from the <ul class="gallery-thumbs"> list:
     <li><button data-src="img/foto.png" data-caption="Texto"></button></li>
   Type is detected from the extension (.mp4/.webm = video, rest = image/gif).
   Images/GIFs advance after IMAGE_TIME ms; videos advance when they end.
   ========================================================= */
(function () {
    const IMAGE_TIME = 5000;
    const SLIDE_TIME = 15000; // info slider: much slower, there is text to read

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const slider = document.querySelector('.info-slider');
    if (slider) initInfoSlider(slider);
    const gallery = document.querySelector('.gallery');
    if (gallery) initGallery(gallery);
    initReveal();
    initRolesChain();

    // Hide the connecting line after the last role of each wrapped row
    function initRolesChain() {
        const items = [...document.querySelectorAll('.roles-chain li')];
        if (!items.length) return;
        const update = () => {
            items.forEach((li, i) => {
                const next = items[i + 1];
                li.classList.toggle('row-end', !next || next.offsetTop > li.offsetTop + 2);
            });
        };
        update();
        window.addEventListener('resize', update);
        if (document.fonts) document.fonts.ready.then(update);
    }

    // Briefly tilt a joystick, as if the player pushed it
    function pushStick(stick) {
        stick.classList.add('pushed');
        setTimeout(() => stick.classList.remove('pushed'), 250);
    }

    /* ---------- Info slider: sections side by side, one visible at a time ---------- */
    function initInfoSlider(root) {
        const track = root.querySelector('.slider-track');
        const slides = [...root.querySelectorAll('.info-slide')];
        const tabsBox = root.querySelector('.slider-tabs');
        const prevBtn = root.querySelector('.stick-btn.left');
        const nextBtn = root.querySelector('.stick-btn.right');
        if (!slides.length) return;

        // One tab per slide, labelled with its data-title
        const tabs = slides.map((slide, i) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'slider-tab';
            tab.id = `slider-tab-${i}`;
            tab.setAttribute('role', 'tab');
            tab.innerHTML = `${slide.dataset.title}<span class="tab-progress"></span>`;
            tab.addEventListener('click', () => go(i));
            tabsBox.appendChild(tab);

            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-labelledby', tab.id);
            return tab;
        });

        let current = 0;
        let elapsed = 0;
        let hovering = false;
        let focused = false;
        let inView = false;

        function go(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(calc(${-current} * (100% + var(--slide-gap))))`;
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === current);
                s.inert = i !== current; // hidden slides can't be tabbed into
            });
            tabs.forEach((t, i) => {
                t.classList.toggle('active', i === current);
                t.setAttribute('aria-selected', i === current);
                t.querySelector('.tab-progress').style.width = '0';
            });
            elapsed = 0;
        }

        prevBtn.addEventListener('click', () => { pushStick(prevBtn); go(current - 1); });
        nextBtn.addEventListener('click', () => { pushStick(nextBtn); go(current + 1); });

        // Pause while the visitor is reading (mouse over / keyboard focus) or it is off screen
        root.addEventListener('mouseenter', () => { hovering = true; });
        root.addEventListener('mouseleave', () => { hovering = false; });
        root.addEventListener('focusin', () => { focused = true; });
        root.addEventListener('focusout', () => { focused = false; });
        new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { threshold: 0.4 })
            .observe(root);

        document.addEventListener('keydown', e => {
            if (!inView || e.target.closest('input, textarea') || isInView(document.querySelector('.gallery-stage'))) return;
            if (e.key === 'ArrowLeft') { pushStick(prevBtn); go(current - 1); }
            if (e.key === 'ArrowRight') { pushStick(nextBtn); go(current + 1); }
        });

        // Autoplay clock: only counts while nothing is pausing it
        let last = performance.now();
        function tick(now) {
            const dt = now - last;
            last = now;
            if (!reducedMotion && inView && !hovering && !focused && !document.hidden) {
                elapsed += dt;
                tabs[current].querySelector('.tab-progress').style.width = `${Math.min(elapsed / SLIDE_TIME, 1) * 100}%`;
                if (elapsed >= SLIDE_TIME) go(current + 1);
            }
            requestAnimationFrame(tick);
        }

        go(0);
        requestAnimationFrame(tick);
    }

    function isInView(el) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
        return visible > r.height * 0.4;
    }

    function initGallery(root) {
        const stage = root.querySelector('.gallery-stage');
        const caption = root.querySelector('.gallery-caption');
        const counter = root.querySelector('.gallery-counter');
        const progress = root.querySelector('.gallery-progress');
        const toggle = root.querySelector('.gallery-toggle');
        const prevBtn = root.querySelector('.stick-btn.left');
        const nextBtn = root.querySelector('.stick-btn.right');
        const thumbs = [...root.querySelectorAll('.gallery-thumbs button')];
        if (!thumbs.length) return;

        const isVideo = src => /\.(mp4|webm|mov)$/i.test(src);

        // Fill every thumbnail with a preview of its media
        thumbs.forEach((btn, i) => {
            const src = btn.dataset.src;
            btn.dataset.type = isVideo(src) ? 'video' : 'image';
            btn.setAttribute('aria-label', btn.dataset.caption || `Elemento ${i + 1}`);
            if (isVideo(src)) {
                const v = document.createElement('video');
                // #t= jumps a bit in so the preview isn't a black first frame
                v.src = src + '#t=2';
                v.muted = true;
                v.preload = 'metadata';
                btn.appendChild(v);
            } else {
                const img = document.createElement('img');
                img.src = btn.dataset.thumb || src;
                img.alt = '';
                img.loading = 'lazy';
                btn.appendChild(img);
            }
            btn.addEventListener('click', () => show(i, true));
        });

        let current = -1;
        let timer = null;
        let playing = !reducedMotion;
        let media = null;

        function show(index, byUser) {
            current = (index + thumbs.length) % thumbs.length;
            const btn = thumbs[current];
            const src = btn.dataset.src;
            clearTimeout(timer);

            if (media) media.remove();
            if (isVideo(src)) {
                media = document.createElement('video');
                media.src = src;
                media.muted = true;
                media.playsInline = true;
                media.controls = true;
                media.autoplay = true;
                media.addEventListener('ended', () => { if (playing) show(current + 1); });
                media.addEventListener('timeupdate', () => {
                    if (media.duration) setProgress(media.currentTime / media.duration, false);
                });
                // If autoplay is paused, just loop the video
                media.loop = !playing;
            } else {
                media = document.createElement('img');
                media.src = src;
                media.alt = btn.dataset.caption || '';
            }
            stage.classList.toggle('is-video', isVideo(src));
            stage.prepend(media);

            caption.textContent = btn.dataset.caption || '';
            counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(thumbs.length).padStart(2, '0')}`;
            thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
            if (byUser) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

            scheduleNext();
        }

        // Images: animate the bar and move on after IMAGE_TIME
        function scheduleNext() {
            clearTimeout(timer);
            if (isVideo(thumbs[current].dataset.src)) return;
            setProgress(0, false);
            if (!playing) return;
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setProgress(1, true);
            }));
            timer = setTimeout(() => show(current + 1), IMAGE_TIME);
        }

        function setProgress(ratio, animated) {
            progress.style.transition = animated ? `width ${IMAGE_TIME}ms linear` : 'none';
            progress.style.width = `${ratio * 100}%`;
        }

        prevBtn.addEventListener('click', () => { pushStick(prevBtn); show(current - 1, true); });
        nextBtn.addEventListener('click', () => { pushStick(nextBtn); show(current + 1, true); });

        // Play / pause the automatic slideshow
        function updateToggle() {
            toggle.innerHTML = playing
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
            toggle.setAttribute('aria-label', playing ? 'Pausar pase automático' : 'Reanudar pase automático');
        }

        toggle.addEventListener('click', () => {
            playing = !playing;
            updateToggle();
            if (media && media.tagName === 'VIDEO') media.loop = !playing;
            scheduleNext();
        });

        // Arrow keys move the gallery while it is on screen
        let inView = false;
        new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { threshold: 0.4 })
            .observe(stage);
        document.addEventListener('keydown', e => {
            if (!inView || e.target.closest('input, textarea')) return;
            if (e.key === 'ArrowLeft') { pushStick(prevBtn); show(current - 1, true); }
            if (e.key === 'ArrowRight') { pushStick(nextBtn); show(current + 1, true); }
        });

        updateToggle();
        show(0);
    }

    function initReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('visible'));
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach(el => io.observe(el));
    }
})();
