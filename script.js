import { Curtains, Plane } from 'curtainsjs';
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'

window.addEventListener("load", () => {
    const curtains = new Curtains({
        container: "canvas",
        watchScroll: false,
        pixelRatio: Math.min(1.5, window.devicePixelRatio)
    });

    // get our plane element
    const planeElement = document.querySelector(".multi-textures");

    // here we will handle which texture is visible and the timer to transition between images
    const slidesState = {
        activeTextureIndex: 1,
        nextTextureIndex: null,
        maxTextures: planeElement.querySelectorAll("img").length - 1,
        navs: document.querySelectorAll('[data-goto]'),

        isChanging: false,
        transitionTimer: 0,
    };

    const navigationDirection = to => {
        if (to == 'next') {
            if (slidesState.activeTextureIndex < slidesState.maxTextures) {
                slidesState.nextTextureIndex = slidesState.activeTextureIndex + 1;
            } else {
                slidesState.nextTextureIndex = 1;
            }
        } else {
            if (slidesState.activeTextureIndex <= 1) {
                slidesState.nextTextureIndex = slidesState.maxTextures;
            } else {
                slidesState.nextTextureIndex = slidesState.activeTextureIndex - 1;
            }
        }
    }

    // handling errors
    curtains.onError(() => {
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtains", "image-1");

        // handle simple slides management here
        slidesState.navs.forEach(nav => {
            nav.addEventListener("click", event => {
                const to = event.target.getAttribute('data-goto');
                navigationDirection(to);

                document.body.classList.remove("image-1", "image-2", "image-3", "image-4");
                document.body.classList.add("image-" + slidesState.nextTextureIndex);

                slidesState.activeTextureIndex = slidesState.nextTextureIndex;

            });
        })
    }).onContextLost(() => {
        // on context lost, try to restore the context
        curtains.restoreContext();
    });

    // disable drawing for now
    curtains.disableDrawing();

    // some basic parameters
    const params = {
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
            transitionTimer: {
                name: "uTransitionTimer",
                type: "1f",
                value: 0,
            },
        },
    };

    const multiTexturesPlane = new Plane(curtains, planeElement, params);

    multiTexturesPlane.onLoading((texture) => {
        // improve texture rendering on small screens with LINEAR_MIPMAP_NEAREST minFilter
        texture.setMinFilter(curtains.gl.LINEAR_MIPMAP_NEAREST);
    })
    .onReady(() => {
        // the idea here is to create two additionnal textures
        // the first one will contain our visible image
        // the second one will contain our entering (next) image
        // that way we will deal with only activeTexture and nextTexture samplers in the fragment shader
        // and we could easily add more images in the slideshow...

        // first we set our very first image as the active texture
        const activeTexture = multiTexturesPlane.createTexture({
            sampler: "activeTexture",
            fromTexture: multiTexturesPlane.textures[slidesState.activeTextureIndex]
        });
        // next we set the second image as next texture but this is not mandatory
        // as we will reset the next texture on slide change
        const nextTexture = multiTexturesPlane.createTexture({
            sampler: "nextTexture",
            fromTexture: multiTexturesPlane.textures[slidesState.nextTextureIndex]
        });

        slidesState.navs.forEach(nav => {
            nav.addEventListener('click', event => {
                
                if (!slidesState.isChanging) {
                    // enable drawing for now
                    curtains.enableDrawing();

                    slidesState.isChanging = true;

                    // check what will be next image
                    const to = event.target.getAttribute('data-goto');
                    navigationDirection(to);

                    // apply it to our next texture
                    nextTexture.setSource(multiTexturesPlane.images[slidesState.nextTextureIndex]);

                    setTimeout(() => {
                        // disable drawing now that the transition is over
                        curtains.disableDrawing();

                        slidesState.isChanging = false;
                        slidesState.activeTextureIndex = slidesState.nextTextureIndex;
                        // our next texture becomes our active texture
                        activeTexture.setSource(multiTexturesPlane.images[slidesState.activeTextureIndex]);
                        // reset timer
                        slidesState.transitionTimer = 0;

                    }, 1700); // add a bit of margin to the timer
                }
            })
        })

    }).onRender(() => {
        // increase or decrease our timer based on the active texture value
        if (slidesState.isChanging) {
            // use damping to smoothen transition
            slidesState.transitionTimer += (90 - slidesState.transitionTimer) * 0.04;

            // force end of animation as damping is slower the closer we get from the end value
            if (slidesState.transitionTimer >= 88.5 && slidesState.transitionTimer !== 90) {
                slidesState.transitionTimer = 90;
            }
        }

        // update our transition timer uniform
        multiTexturesPlane.uniforms.transitionTimer.value = slidesState.transitionTimer;
    });

});
