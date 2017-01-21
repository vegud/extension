/**
 * Created by sbreitenstein on 19/01/17.
 */

Polymer({
    is: 'movie-portal-selection',
    behaviors: [SubtitleSelectionBehavior],
    properties:{
      simpleName:{
          type:String,
          value:'Movie Portal Selection'
      }
    },
    listeners:{
        "refreshSubtitle":"retargetingSelectionElement",
        "resetSubtitle":"retargetingSelectionElement"
    },
    retargetingSelectionElement:function(event,data){
        Object.assign(data,{selectionElement:this});
    },

    reset(){
        this.$.movieSelectize.currentSelected=null;
        this.$.subtitleSelectize.currentSelected=null;
    }
});