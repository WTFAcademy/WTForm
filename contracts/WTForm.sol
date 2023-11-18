// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract WTForm {
    // Structure to store each form
    struct Form {
        uint256 formId;
        address creator;
        bytes32 formHash; // Hash of the form questions
        string title;
    }

    // Structure to store form responses
    struct Response {
        uint256 formId;
        address responder;
        bytes32 responseHash; // Hash of the response
    }

    // Array of all forms
    Form[] private forms;

    // Mapping from form ID to its responses
    mapping(uint256 => Response[]) private formResponses;

    // Event to emit when a new form is created
    event FormCreated(uint256 indexed formId, address indexed creator, bytes32 formHash, string title);

    // Event to emit when a new response is submitted
    event ResponseSubmitted(uint256 indexed formId, address indexed responder, bytes32 responseHash);

    // Function to create a new form
    function createForm(string memory title, bytes32 formHash) public {
        uint256 formId = forms.length;
        Form memory newForm = Form(formId, msg.sender, formHash, title);
        forms.push(newForm);
        emit FormCreated(formId, msg.sender, formHash, title);
    }

    // Function to submit a response to a form
    function submitResponse(uint256 formId, bytes32 responseHash) public {
        require(formId < forms.length, "Form does not exist");

        Response memory newResponse = Response(formId, msg.sender, responseHash);
        formResponses[formId].push(newResponse);
        emit ResponseSubmitted(formId, msg.sender, responseHash);
    }

    // Function to get details of a form
    function getForm(uint256 formId) public view returns (Form memory) {
        require(formId < forms.length, "Form does not exist");
        return forms[formId];
    }

    // Function to get all responses for a form
    function getResponses(uint256 formId) public view returns (Response[] memory) {
        require(formId < forms.length, "Form does not exist");
        return formResponses[formId];
    }
}
