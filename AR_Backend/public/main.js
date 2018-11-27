$( document ).ready(function() {
      $('#save').click( function() {
        var experience = $('#experience').val(),
          education = $( "#degree" ).val(),
          hw_engineer_skills = $("#hw_engineer").tagsinput('items'),
          sw_engineer_skills = $("#sw_engineer").tagsinput('items'),
          data_scientist_skills = $("#data_scientist").tagsinput('items'),
          web_developer_skills = $("#web_developer").tagsinput('items'),
          ugrad_required = false,
          grad_required = false
          
        if(education == 'ugrad_required') {
          ugrad_required = true
        }
        else {
          ugrad_required = true
          grad_required = true
        }
        var skillroleDictionary = {
          "sw_engineer" : sw_engineer_skills,
          "hw_engineer" : hw_engineer_skills,
          "data_scientist" : data_scientist_skills,
          "web_developer" : web_developer_skills,
          "experience" : experience,
          "grad_required": grad_required,
          "ugrad_required" : ugrad_required
        }
        $.ajax({
          url: 'http://localhost:8095/skills',
          // dataType: "jsonp",
          data: skillroleDictionary,
          type: 'POST',
          //jsonpCallback: 'callback', // this is not relevant to the POST anymore
          success: function (data) {
              var ret = jQuery.parseJSON(data);
              $('#lblResponse').html(ret.msg);
              console.log('Success: ')
              alert("Saved successfully!");
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
              $('#lblResponse').html('Error connecting to the server.');
          },
        });
      });
});
