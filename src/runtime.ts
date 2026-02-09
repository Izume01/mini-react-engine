/**
 * We will define a nextWorkInProgress to store the next fiber
 */
let nextWorkInProgress: any = null
let wipRoot: any = null

/**
 * check for how much time is left if its less than 1ms we will yield to the main thread and continue the work in the next idle callback
 * @param deadline 
 */
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false   // this will be true if we need to yield to the main thread

  while (nextWorkInProgress && !shouldYield) {
    nextWorkInProgress = performUnitOfWork(nextWorkInProgress) // this will return the next fiber to work on after performing the current unit of work
    shouldYield  = deadline.timeRemaining() < 1
  }

  if (!nextWorkInProgress && wipRoot) {
    commitRoot()
  }
  
  // Only schedule next callback if there's still work to do
  if (nextWorkInProgress) {
    requestIdleCallback(workLoop)
  } else {
    wipRoot = null
  }
}

function performUnitOfWork(fiber: any) {
  if (!fiber.dom) {
    fiber.dom = Rizzy.createDom(fiber) // create the dom for the current fiber
  }
  
  const element = fiber.props?.children
  if (!element || !Array.isArray(element)) {
    // No children, return next fiber (sibling or parent's sibling)
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {  
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
    return null
  }
  
  let idx = 0 
  let prevSibling = null
  
  while (idx < element.length) {
    const child = element[idx]
    
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null
    }
    
    if (idx === 0) {
      fiber.child = newFiber;
    } else if (prevSibling !== null) {
      (prevSibling as any).sibling = newFiber;
    }
    prevSibling = newFiber;
    idx++;
  }
  
  // Return the next fiber to work on: child first, then sibling, then parent's sibling
  if (fiber.child) {
    return fiber.child
  }
  
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {  
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
  
  return null
}

function commitRoot() {
  // commit the root fiber to the dom
  commitWork(wipRoot.root)
  wipRoot = null
}

function commitWork(fiber: any) {
  if (!fiber) return 

  const domParent = fiber.parent ? fiber.parent.dom : null
  if (fiber.dom && domParent) {
    domParent.appendChild(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)

}

export const Rizzy = {

  /**
   * 
   * @param type : element like h1, p etc
   * @param prop : properties like id, class etc
   * @param children  : children of the element like text or other element
   * 
   * we will return an object with type and props
   * type will be the type of the element like h1, p etc
   * props will be an object with all the properties of the element like id, class etc and children
   * we will map through the children and if its a string we will create a text element else we will return the child as it is
   * @returns 
   */
  createElement(type: string, prop: any, ...children: any[]) {    
    
    
    const normalize = (child: any): any  => {
        
      if (child === null || child === false || child === true) {
        return null
      }
      
      if (Array.isArray(child)) {
        return child.map(normalize)
      }
      
      if (typeof child === "object") {
        return child
      } 
      
      return {
        type: "TEXT_ELEMENT", 
        props: {
          nodeValue: child,
          children: []
        }
      }
    }
    
    let normalizeChildren = 
      children
        .map(normalize)
        .flat()
        .filter(Boolean)
    
    return {
      type,
      props: {
        ...(prop || {}),
        children: normalizeChildren
      }
    }
  },
  createDom(fiber: any) {
    /**
     * if its a value create a note else a element
     */
    const dom = 
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode(fiber.props.nodeValue)
        : document.createElement(fiber.type);
    
    /**
     * 
     * @param key 
     * We are getting all the Key from the element.prop
     * {id , class , children} then we will filter out the children from the rest
     * we will grab the name , then apply to the dom and the assign the value from the element
     * @returns 
     */
    const isProperty = (key: string) => key !== "children";
    
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        const value = fiber.props[name];

        if (name === "style" && typeof value === "object") {
          Object.assign(dom.style, value);
        } 
        else if (name === "className") {
          dom.className = value;
        } else {
            dom[name] = value;  
        }
      })
    
    return dom
  },
  render(element: any, container: HTMLElement | null) {
    wipRoot = {
      dom: container,
      root: {
        type: element.type,
        props: element.props,
        dom: null,
        parent: {
          dom: container
        }
      }
    }
    // Start the work loop
    nextWorkInProgress = wipRoot.root
    requestIdleCallback(workLoop)
  }
}
