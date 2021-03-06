import React, {useRef, useEffect} from "../../_snowpack/pkg/react.js";
const WithDropTarget = ({children, id, registerDropTarget, unregisterDropTarget, dropCallbacks}) => {
  const dropRef = useRef();
  const {onDragOver, onDragHover, onDrop} = dropCallbacks;
  useEffect(() => {
    registerDropTarget({id, ref: dropRef.current, onDragOver, onDragHover, onDrop});
    return () => {
      unregisterDropTarget(id);
    };
  }, [id, registerDropTarget, unregisterDropTarget]);
  return /* @__PURE__ */ React.createElement("div", {
    ref: dropRef
  }, children);
};
export default WithDropTarget;
