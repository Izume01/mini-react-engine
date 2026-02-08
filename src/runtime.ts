export const Rizzy = {
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
    const dom = 
      element.type === "TEXT_ELEMENT"
        ? document.createTextNode(element.props.nodeValue)
        : document.createElement(element.type);
    
    element.props.children.forEach((child: any) => {
      this.render(child , dom);
    })
    
    container?.appendChild(dom);
  }

}
