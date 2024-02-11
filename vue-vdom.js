// Create a virtual node

export function h(tag, props, children){
    return { tag, props, children }
}

// tag = h1
// props = {class: 'text-red-500'}
// children = 'hello world!'
// Add a vnode into the DOM

export function mount(vnode, container){
    debugger;
    const el = document.createElement(vnode.tag);
    vnode.el = el
    
    // Handle props
    for (const key in vnode.props){
        // key: class
        // vnode.props[key]: 'text-red-500'
        
        if (key.startsWith('on')){
            // When it's an event
            // onClick => click
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, vnode.props[key]);
        }
        else {
            // When it's a regular attribute
            el.setAttribute(key, vnode.props[key]);
        }
    }

    // Add children
    if (typeof vnode.children === 'string'){
        // Text
        el.textContent = vnode.children;
    }
    else if (Array.isArray(vnode.children)){
        // Array of vnodes
        vnode.children.forEach(child => {
            mount(child, el);
        })
    }
    else{
        // Single vnode
        mount(vnode.children, el)
    }

    // Add to a real DOM
    container.appendChild(el);
}


// Remove element from vnode
export function unmount(vnode){
    vnode.el.parentNode.removeChild(vnode.el);
}


// Take 2 virtual nodes, compare & figure out what's the difference.

export function patch(vn1, vn2){
    const el = (vn2.el = vn1.el);
    // Case when tag is different
    if (vn1.tag != vn2.tag){
        mount(vn2, el.parentNode);
        unmount(vn1);
    }
    
    // Case when nodes are of the same tag
    else{

        // Case when new virtual node has string children
        if (typeof vn2.children === 'string'){
            el.textContent = vn2.children;
        }

        // New virtual node has an array children
        else{

            // Case when old virtual node (vn1) has str children
            if (typeof vn1.children === 'string'){
                el.textContent = '';
                vn2.children.forEach(child => mount(child, el))
            }
            else{
                const c1 = vn1.children;
                const c2 = vn2.children;
                
                // Common length of both virtual node's children
                const commonLength = Math.min(c1.length, c2.length);

                // Patch commong length
                for (let i=0; i < commonLength; i++){
                    patch(c1[i], c2[i]);
                }

                // Old virtual node children were longer, then unmount the extra ones
                if (c1.length > c2.length){
                    c1.slice(c2.length).forEach(child => unmount(child));
                }
                
                // New virtual node has more children
                else if (c2.length > c1.length){
                    c2.slice(c1.length).forEach(child => mount(child, el))
                }
            }
    }
}
}