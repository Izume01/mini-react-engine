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
    return {
      type,
      props: {
        ...(prop || {}),
        children: children.map(child => {
          if (typeof child === "object") {
            return child
          } else {
            return {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: child,
                children: []
              }
            }
          }
        })
      }
    }
  },
  
  render(element: any, container: HTMLElement | null) {
    
    /**
     * if its a value create a note else a element
     */
    const dom = 
      element.type === "TEXT_ELEMENT"
        ? document.createTextNode(element.props.nodeValue)
        : document.createElement(element.type);
    
    /**
     * 
     * @param key 
     * We are getting all the Key from the element.prop
     * {id , class , children} then we will filter out the children from the rest
     * we will grab the name , then apply to the dom and the assign the value from the element
     * @returns 
     */
    const isProperty = (key: string) => key !== "children";
    
    Object.keys(element.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = element.props[name];
      })
    
    /**
     * we will loop through the children and render them as well
     * we will pass the child and the dom as the container to render the child inside the parent
     */
    element.props.children.forEach((child: any) => {
      this.render(child , dom);
    })
    
    container?.appendChild(dom);
  }
}
