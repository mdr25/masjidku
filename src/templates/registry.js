import Template1 from './Template1';
import Template2 from './Template2';

const templateRegistry = {
    'template-1': {
        name: 'Classic Green',
        component: Template1,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+1'
    },
    'template-2': {
        name: 'Sapphire Harmony',
        component: Template2,
        thumbnail: 'https://via.placeholder.com/300x200?text=Template+2'
    }
};

export default templateRegistry;
