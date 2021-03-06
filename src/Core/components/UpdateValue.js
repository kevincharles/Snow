import InlineComponent from './abstract/InlineComponent';

export default class UpdateValue extends InlineComponent {
  constructor(args) {
    super(args);
    this.updateValue = this.updateValue.bind(
      new Proxy(this, this.readOnlyProxyHandler)
    );

    this.actions = {
      updateValue: this.updateValue
    };

  }
  static componentType = "updateValue";

  static createAttributesObject(args) {
    let attributes = super.createAttributesObject(args);
    // attributes.width = {default: 300};
    // attributes.height = {default: 50};
    attributes.label = {
      createComponentOfType: "text",
      createStateVariable: "label",
      defaultValue: "update value",
      public: true,
      forRenderer: true,
    };

    return attributes;
  }

  static returnChildLogic (args) {
    let childLogic = super.returnChildLogic(args);

    let exactlyOneMathTarget = childLogic.newLeaf({
      name: "exactlyOneMathTarget",
      componentType: 'mathtarget',
      number: 1,
    });

    let exactlyOneNewMathValue = childLogic.newLeaf({
      name: "exactlyOneNewMathValue",
      componentType: 'newmathvalue',
      number: 1,
    });

    childLogic.newOperator({
      name: "updateValueLogic",
      operator: 'and',
      propositions: [exactlyOneMathTarget, exactlyOneNewMathValue],
      setAsBase: true,
    });

    return childLogic;
  }



  static returnStateVariableDefinitions() {

    let stateVariableDefinitions = super.returnStateVariableDefinitions();

    stateVariableDefinitions.targetedMathName = {
      returnDependencies: () => ({
        mathTarget: {
          dependencyType: "child",
          childLogicName: "exactlyOneMathTarget",
          variableNames: ["mathChildName"]
        },
      }),
      definition: function ({ dependencyValues }) {
        return {
          newValues: {
            targetedMathName: dependencyValues.mathTarget[0].stateValues.mathChildName
          }
        };
      },
    }

    stateVariableDefinitions.newMathValue = {
      returnDependencies: () => ({
        newMathValueChild: {
          dependencyType: "child",
          childLogicName: "exactlyOneNewMathValue",
          variableNames: ["value"]
        },
      }),
      definition: function ({ dependencyValues }) {
        return {
          newValues: {
            newMathValue: dependencyValues.newMathValueChild[0].stateValues.value
          }
        };
      },
    }

    return stateVariableDefinitions;

  }


  updateValue({ }) {
    this.coreFunctions.requestUpdate({
      updateInstructions: [{
        updateType: "updateValue",
        componentName: this.stateValues.targetedMathName,
        stateVariable: "value",
        value: this.stateValues.newMathValue,
      }],
      event: {
        verb: "selected",
        object: {
          componentName: this.componentName,
          componentType: this.componentType,
        },
        result: {
          response: this.stateValues.newMathValue,
          responseText: this.stateValues.newMathValue.toString(),
        }
      }
    });

  }

}