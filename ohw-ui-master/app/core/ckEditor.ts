export default function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) { 
            var ckeditor=CKEDITOR.replace(
                elem[0],
                {
                    toolbar:"Basic"

                }
            );
            if(!ngModel)
            return;
            var updateModel=false;
            ckeditor.on('instanceReady',function(){
                ckeditor.setData(ngModel.$viewValue)
            });

            function update(){
                if(updateModel){
                    ngModel.$setViewValue(ckeditor.getData());
                }
            }
            ngModel.$render=function(value){
                ckeditor.setData(ngModel.$viewValue);
            }
            ckeditor.on('change',update);
            ckeditor.on('focus',function(event){
                updateModel=true;
            })
            scope.$on('$destroy',function(){
                ckeditor.removeAllListeners();
                 CKEDITOR.remove(ckeditor);
            })
        }
    }
}