// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {People} from "./Karobar.sol";
import {KBRToken} from "./Karobar.sol";
//TokenTransferor-crosschain transfer of tokens
contract TokenTransferor is OwnerIsCreator {
    using SafeERC20 for IERC20;


    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); 
    error NothingToWithdraw(); 
    error FailedToWithdrawEth(address owner, address target, uint256 value); 
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector); 
    error InvalidReceiverAddress();

    event TokensTransferred(
        bytes32 indexed messageId, 
        uint64 indexed destinationChainSelector, 
        address receiver, 
        address token, 
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );

    
    mapping(uint64 => bool) public allowlistedChains;

    IRouterClient private s_router;

    IERC20 private s_linkToken;
    People public people;
    KBRToken public kbrtoken;
   
    constructor(address _router, address _link,address ot,address ot1) {
        s_router = IRouterClient(_router);
        s_linkToken = IERC20(_link);
        kbrtoken=KBRToken(ot);
        people=People(ot1);
        kbrtoken.mint(address(this), 30000000 * (10 ** kbrtoken.decimals()));
        kbrtoken.approve(address(this), 300000 * (10 ** kbrtoken.decimals()));
        kbrtoken.allowance(msg.sender, address(this));
    }


    modifier onlyAllowlistedChain(uint64 _destinationChainSelector) {
        if (!allowlistedChains[_destinationChainSelector])
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }

    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }

   
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool allowed
    ) external onlyOwner {
      
        allowlistedChains[_destinationChainSelector] = allowed;
    }

  
    function transferTokensPayLINK(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    )
        external
        onlyAllowlistedChain(_destinationChainSelector)
        validateReceiver(_receiver)
        returns (bytes32 messageId)
    {
        require(people.isAUser(msg.sender)==true,"invalid user");
     
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(s_linkToken)
        );

      
        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        
        s_linkToken.approve(address(s_router), fees);

       
        IERC20(_token).approve(address(s_router), _amount);

        
        messageId = s_router.ccipSend(
            _destinationChainSelector,
            evm2AnyMessage
        );
          kbrtoken.transferFrom(
                address(this),
                msg.sender,
                5 * (10 ** kbrtoken.decimals())
            );
         people.updateUserRating(msg.sender);
        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(s_linkToken),
            fees
        );

      
        return messageId;
    }

    function transferTokensPayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    )
        external
        onlyAllowlistedChain(_destinationChainSelector)
        validateReceiver(_receiver)
        returns (bytes32 messageId)
    {
        require(people.isAUser(msg.sender)==true,"invalid user");
       
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0)
        );

       
        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

       
        IERC20(_token).approve(address(s_router), _amount);

       
        messageId = s_router.ccipSend{value: fees}(
            _destinationChainSelector,
            evm2AnyMessage
        );
        kbrtoken.transferFrom(
                address(this),
                msg.sender,
                5 * (10 ** kbrtoken.decimals())
            );
         people.updateUserRating(msg.sender);
        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(0),
            fees
        );

      
        return messageId;
    }

    
    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
       
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

       
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), 
                data: "", 
                tokenAmounts: tokenAmounts, 
                extraArgs: Client._argsToBytes(
                   
                    Client.EVMExtraArgsV2({
                        gasLimit: 0, 
                        allowOutOfOrderExecution: true 
                    })
                ),
                
                feeToken: _feeTokenAddress
            });
    }


    receive() external payable {}

   
    function withdraw(address _beneficiary) public {
      
        uint256 amount = address(this).balance;
        require(people.isAUser(msg.sender)==true,"invalid user");
       
        if (amount == 0) revert NothingToWithdraw();

      
        (bool sent, ) = _beneficiary.call{value: amount}("");

        
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
        people.updateUserRating(msg.sender);
    }

   
    function withdrawToken(
        address _beneficiary,
        address _token
    ) public {
        
        uint256 amount = IERC20(_token).balanceOf(address(this));

        require(people.isAUser(msg.sender)==true,"invalid user");
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
         
    }
}