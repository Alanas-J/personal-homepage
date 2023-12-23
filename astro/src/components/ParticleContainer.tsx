import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

const options = {
    style: {
        position: "inherit",
    },
    fpsLimit: 120,
    particles: {
        number: {
            value: 80
        },
        color: {
            value: "#DDDDDD",
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.5
        },
        size: {
            value: { min: 1, max: 4 }
        },
        links: {
            enable: true,
            distance: 100,
            color: "random",
            opacity: 0.4,
            width: 1,
            triangles: {
                enable: true,
                color: "#ffffff",
                opacity: 0.1
            }
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            outModes: "out"
        }
    },
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "attract"
            },
            onClick: {
                enable: true,
                mode: "repulse"
            }
        },
        modes: {
            attract: {
                distance: 400
            },
            repulse: {
                distance: 200
            }
        }
    }
}

/* options gets serialized, changing object values directly has not effect, a usestate will be needed.
window.onresize = () => {
    addDynamicValuesToOptions(options)
}
*/
function addDynamicValuesToOptions(options: any): void {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    if(vw > 1024) {
        options.particles.links.distance = 100
        options.particles.number.value = 80
    } else if(vw > 768) {
        options.particles.links.distance = 50
        options.particles.number.value = 60
    } else {
        options.particles.links.distance = 50
        options.particles.number.value = 30
    }
    console.log(vw)
}
addDynamicValuesToOptions(options)

export default function ParticleContainer() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (init) {
        return <Particles id="particle-canvas" options={options as any} />
    }
    return <></>;
};