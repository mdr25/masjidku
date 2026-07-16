import Template1 from './Template1';
import Template2 from './Template2';

const templateRegistry = {
    // Legacy support
    'template-1': {
        name: 'Classic Green',
        component: Template1,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+1'
    },
    'template-2': {
        name: 'Sapphire Harmony',
        component: Template2,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+2'
    },
    // New standard codes
    'TEMPLATE_A': {
        name: 'Zamrud Harmoni',
        component: Template1,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+A'
    },
    'TEMPLATE_B': {
        name: 'Biru Andalusia',
        component: Template2,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+B'
    }
};

export default templateRegistry;
