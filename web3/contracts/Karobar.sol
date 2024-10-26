//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//PropertyNFT-adssigned for handling RWA
contract PropertyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _propertyIds;
    Counters.Counter private _itemsSold;
    address payable owner;
    uint256 listPrice = 0.0001 ether; 

    KBRToken public kbrtoken;
    People public people;
    struct ListedProperty {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
        string location;
        string size;
        string papers;
        bool forSale;
    }
    event PropertyListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed,
        string location,
        string size,
        string papers,
        bool forSale
    );
    mapping(uint256 => ListedProperty) private idToListedProperty;

    constructor(address ot, address ot1) ERC721("PropertyNFT", "KBRT") {
        kbrtoken = KBRToken(ot);
        people = People(ot1);
        owner = payable(msg.sender);
        kbrtoken.mint(address(this), 30000000 * (10 ** kbrtoken.decimals()));
        kbrtoken.approve(address(this), 300000 * (10 ** kbrtoken.decimals()));
        kbrtoken.allowance(msg.sender, address(this));
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedProperty()
        public
        view
        returns (ListedProperty memory)
    {
        uint256 currentPropertyId = _propertyIds.current();
        return idToListedProperty[currentPropertyId];
    }

    function getListedPropertyForId(
        uint256 propertyId
    ) public view returns (ListedProperty memory) {
        return idToListedProperty[propertyId];
    }

    function getCurrentProperty() public view returns (uint256) {
        return _propertyIds.current();
    }

    function createProperty(
        string memory propertyURI,
        uint256 price,
        string memory _location,
        string memory _size,
        string memory _papers
    ) public payable returns (uint) {
        require(people.checkIsAUser(msg.sender) == true, "only users");
        require(
            people.checkUserVerified(msg.sender) == true,
            "only user verified"
        );
        require(
            people.checkUserBlacklisted(msg.sender) == false,
            "shouldnt be blacklisted"
        );
        _propertyIds.increment();
        uint256 newPropertyId = _propertyIds.current();
        _safeMint(msg.sender, newPropertyId);
        _setTokenURI(newPropertyId, propertyURI);
        createListedProperty(
            newPropertyId,
            price,
            _location,
            _size,
            _papers,
            true
        );
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            10 * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
        return newPropertyId;
    }

    function createListedProperty(
        uint256 tokenId,
        uint256 price,
        string memory _location,
        string memory _size,
        string memory _papers,
        bool _forSale
    ) private {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");
        idToListedProperty[tokenId] = ListedProperty(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true,
            _location,
            _size,
            _papers,
            _forSale
        );

        _transfer(msg.sender, address(this), tokenId);
        emit PropertyListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true,
            _location,
            _size,
            _papers,
            _forSale
        );
    }

    function getAllNFTs() public view returns (ListedProperty[] memory) {
        uint nftCount = _propertyIds.current();
        ListedProperty[] memory properties = new ListedProperty[](nftCount);
        uint currentIndex = 0;
        for (uint i = 0; i < nftCount; i++) {
            uint currentId = i + 1;
            ListedProperty storage currentItem = idToListedProperty[currentId];
            properties[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return properties;
    }

    function getMyNFTs() public view returns (ListedProperty[] memory) {
        require(people.checkIsAUser(msg.sender) == true, "only users");
        uint totalItemCount = _propertyIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < totalItemCount; i++) {
            if (
                idToListedProperty[i + 1].owner == msg.sender ||
                idToListedProperty[i + 1].seller == msg.sender
            ) {
                itemCount += 1;
            }
        }
        ListedProperty[] memory items = new ListedProperty[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (
                idToListedProperty[i + 1].owner == msg.sender ||
                idToListedProperty[i + 1].seller == msg.sender
            ) {
                uint currentId = i + 1;
                ListedProperty storage currentItem = idToListedProperty[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        require(people.checkIsAUser(msg.sender) == true, "only users");
        require(
            idToListedProperty[tokenId].forSale == true,
            "not listed for sale"
        );
        require(
            people.checkUserBlacklisted(msg.sender) == false,
            "shouldnt be blacklisted"
        );
        uint price = idToListedProperty[tokenId].price;
        address seller = idToListedProperty[tokenId].seller;
        idToListedProperty[tokenId].currentlyListed = true;
        idToListedProperty[tokenId].seller = payable(msg.sender);
        _transfer(address(this), msg.sender, tokenId);

        _itemsSold.increment();
        approve(address(this), tokenId);
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            10 * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
    }

    function updateForSell(uint256 _tokenId) external {
        require(
            idToListedProperty[_tokenId].seller == msg.sender,
            "invalid requestor"
        );
        if (idToListedProperty[_tokenId].forSale == true) {
            idToListedProperty[_tokenId].forSale = false;
        } else {
            idToListedProperty[_tokenId].forSale = true;
        }
    }
}
//KBRToken-platform customised ERC20 Token
contract KBRToken is ERC20, ERC20Burnable {
    address payable owner;

    constructor(uint256 initialSupply) ERC20("KBRToken", "KBR") {
        owner = payable(msg.sender);
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    function mint(address account, uint value) public {
        _mint(account, value * (10 ** decimals()));
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can call this function");
        _;
    }
}

error AlreadyAnUser();
error InvalidAccess();
//People-Customize user experience and provide additional layer of security
contract People {
    address immutable owner;
    KBRToken public kbrtoken;

    constructor(address ot) {
        kbrtoken = KBRToken(ot);
        owner = (msg.sender);
        kbrtoken.mint(address(this), 30000000 * (10 ** kbrtoken.decimals()));
        kbrtoken.approve(address(this), 300000 * (10 ** kbrtoken.decimals()));
        kbrtoken.allowance(msg.sender, address(this));
    }

    struct User {
        uint256 uid;
        address userid;
        string name;
        string bio;
        string image_hash;
        string caption;
        uint256 dailycheckin;
        uint256[] dailycheckins;
        address[] followers;
        address[] following;
        uint256 token;
        bool blacklisted;
        uint256 userRating;
        bool verifiedUser;
    }
    mapping(address => bool) public isAUser;
    mapping(address => bool) private gotInitial;
    mapping(address => User) public userCheck;
    mapping(uint256 => User) public users;
    mapping(address => bool) private permittedContracts;
    User[] userArray;

    uint256 totalUserCount = 0;
    uint256 registerCount = 0;
    uint256 permittedContractsCounts = 0;

    function register(
        string memory _name,
        string memory _bio,
        string memory _image_hash,
        string memory _caption
    ) external {
        if (isAUser[msg.sender] == true) revert AlreadyAnUser();
        totalUserCount++;
        User storage user = users[totalUserCount];
        user.uid = totalUserCount;
        user.userid = msg.sender;
        user.name = _name;
        user.bio = _bio;
        user.image_hash = _image_hash;
        user.caption = _caption;
        user.userRating += 1;
        userCheck[msg.sender] = user;
        isAUser[msg.sender] = true;
        userArray.push(user);
        sendInitial();
    }

    function getBalance(address a) public view returns (uint256) {
        return kbrtoken.balanceOf(a);
    }

    function sendInitial() internal {
        registerCount++;
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            5 * (10 ** kbrtoken.decimals())
        );
        userCheck[msg.sender].token = kbrtoken.balanceOf(msg.sender);
        gotInitial[msg.sender] = true;
    }

    function follow(address _user) external {
        require(isAUser[msg.sender] == true, "should be user");
        require(
            userCheck[msg.sender].blacklisted == false,
            "shouldnt be blacklisted"
        );
        userCheck[_user].followers.push(msg.sender);
        followingUpdate(_user);
        userCheck[msg.sender].userRating += 1;
    }

    function followingUpdate(address _user) internal {
        userCheck[msg.sender].following.push(_user);
    }

    function getFollowers(
        address _creator
    ) external view returns (address[] memory) {
        User storage user = userCheck[_creator];
        return user.followers;
    }

    function getFollowing(
        address _creator
    ) external view returns (address[] memory) {
        User storage user = userCheck[_creator];
        return user.following;
    }

    function unfollow(address _follower) external {
        require(isAUser[msg.sender] == true, "should be user");
        require(
            userCheck[msg.sender].blacklisted == false,
            "shouldnt be blacklisted"
        );
        User storage user = userCheck[msg.sender];
        bool x = false;
        for (uint i = 0; i < user.following.length; i++) {
            if (user.following[i] == _follower) {
                address t = user.following[i];
                user.following[i] = user.following[user.following.length - 1];
                user.following[user.following.length - 1] = t;
                x = true;
                break;
            }
        }

        if (x == true) {
            user.following.pop();
            unfollowHandle(_follower, msg.sender);
        }
    }

    function unfollowHandle(address _follower, address x) internal {
        User storage user1 = userCheck[_follower];
        for (uint i = 0; i < user1.followers.length; i++) {
            if (user1.followers[i] == x) {
                address t = user1.followers[i];
                user1.followers[i] = user1.followers[
                    user1.followers.length - 1
                ];
                user1.followers[user1.followers.length - 1] = t;

                break;
            }
            user1.followers.pop();
        }
    }

    function getUserById(address _user) external view returns (User memory) {
        User storage user = userCheck[_user];
        return user;
    }

    function getAllUsers() external view returns (User[] memory) {
        return userArray;
    }

    function dailyCheckinHandler() external {
        require(isAUser[msg.sender] == true, "should be user");
        require(
            userCheck[msg.sender].blacklisted == false,
            "shouldnt be blacklisted"
        );
        User storage user = userCheck[msg.sender];
        if (user.dailycheckins.length == 0) {
            user.dailycheckin = 1;
            user.dailycheckins.push(block.timestamp);
            kbrtoken.transferFrom(
                address(this),
                msg.sender,
                5 * (10 ** kbrtoken.decimals())
            );
            userCheck[msg.sender].token = kbrtoken.balanceOf(msg.sender);
        } else if (user.dailycheckins.length > 0) {
            if (
                (block.timestamp -
                    user.dailycheckins[user.dailycheckins.length - 1]) >=
                24 hours
            ) {
                user.dailycheckin += 1;
                user.dailycheckins.push(block.timestamp);
                kbrtoken.transferFrom(
                    address(this),
                    msg.sender,
                    5 * (10 ** kbrtoken.decimals())
                );
                userCheck[msg.sender].token = kbrtoken.balanceOf(msg.sender);
            }
        }
    }

    function blacklistUserCheck(address _user) external {
        require(msg.sender == owner, "Must be owner");
        require(isAUser[_user] == true, "must be user");
        if (userCheck[_user].blacklisted == true) {
            userCheck[_user].blacklisted = false;
        } else {
            userCheck[_user].blacklisted = true;
        }
    }

    function provideContractPermission(address _contract) external {
        require(msg.sender == owner, "only owner can modify");
        permittedContractsCounts++;
        permittedContracts[_contract] = true;
    }

    function updateContractPermission(address _contract) external {
        require(msg.sender == owner, "only owner can modify");
        if (permittedContracts[_contract] == true) {
            permittedContracts[_contract] = false;
        } else {
            permittedContracts[_contract] = true;
        }
    }

    function updateUserRating(address _user) public {
        require(
            permittedContracts[msg.sender] == true,
            "only permitted contracts can update"
        );
        require(
            userCheck[msg.sender].blacklisted == false,
            "shouldnt be blacklisted"
        );
        require(isAUser[_user] == true, "must be user");
        userCheck[_user].userRating += 1;
    }

    function checkIsAUser(address _user) external view returns (bool) {
        return isAUser[_user];
    }

    function verifyUser(address _user) external {
        require(msg.sender == owner, "only owner can update");
        require(isAUser[_user] == true, "not an user");
        userCheck[_user].verifiedUser = true;
    }

    function checkUserVerified(address _user) external view returns (bool) {
        return userCheck[_user].verifiedUser;
    }

    function checkUserBlacklisted(address _user) external view returns (bool) {
        return userCheck[_user].blacklisted;
    }
}
//BetterIndia-scheme currated for country's growth
contract BetterIndia {
    address immutable owner;
    People people;

    constructor(address ot) {
        owner = msg.sender;
        people = People(ot);
    }

    struct MakeBetter {
        string title;
        string description;
        string imageHash;
        address creator;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
    }
    mapping(uint256 => MakeBetter) public gifts;
    MakeBetter[] giftsArray;
    uint256 giftsCount = 0;

    function createGift(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        string memory _imageHash
    ) external {
        require(
            people.checkIsAUser(msg.sender) == true,
            "only user can create"
        );
        require(
            people.checkUserVerified(msg.sender) == true,
            "only user verified"
        );
        MakeBetter storage gift = gifts[giftsCount];

        

        gift.creator = msg.sender;
        gift.title = _title;
        gift.description = _description;
        gift.deadline = _deadline;
        gift.amountCollected = 0;
        gift.imageHash = _imageHash;
        giftsArray.push(gift);
        people.updateUserRating(msg.sender);
    }

    function donateToBetterIndia(uint256 _id) public payable {
        uint256 amount = msg.value;
        require(
            people.checkIsAUser(msg.sender) == true,
            "only user can donate"
        );

        MakeBetter storage gift = gifts[_id];

        gift.donators.push(msg.sender);

        (bool sent, ) = payable(gift.creator).call{value: amount}("");

        if (sent) {
            gift.amountCollected = gift.amountCollected + amount;
        }
        people.updateUserRating(msg.sender);
    }

    function getDonators(uint256 _id) public view returns (address[] memory) {
        return (gifts[_id].donators);
    }

    function getGiftById(
        uint256 _id
    ) external view returns (MakeBetter memory) {
        MakeBetter storage gift1 = gifts[_id];
        return gift1;
    }

    function getGifts() public view returns (MakeBetter[] memory) {
        return giftsArray;
    }
}
//Insurance-handles the insurance schemes
error MinimumDepositAmountInvalid();
error InsufficientFundToStartInsurance();
error NotAValidPid();
error NotEnoughFund();
error NotValidParticularPid();
error RegisteredAsACustomer();
error InvalidCreator();

contract Insurance {
    address public immutable owner;

    struct InsuranceSchemes {
        uint256 pid;
        address payable creator;
        string name;
        string description;
        string coverage;
        uint256 min_deposition_amount;
        uint256 deposit_amount_monthwise;
        uint256 duration;
        uint256 totalamount;
        uint256 no_of_investors;
        string insurance_type;
        uint256 safe_fees;
        address[] inverstorPid;
    }
    mapping(address => InsuranceSchemes[]) public investment_made;
    mapping(address => InsuranceSchemes[]) public investment_bought;
    mapping(uint256 => InsuranceSchemes) public insurance_scheme_list;
    mapping(uint256 => InsuranceSchemes) public car_insurance_scheme_list;
    mapping(uint256 => InsuranceSchemes) public health_insurance_scheme_list;
    mapping(uint256 => InsuranceSchemes) public buisness_insurance_scheme_list;
    mapping(uint256 => InsuranceSchemes) public home_insurance_scheme_list;
    mapping(uint256 => InsuranceSchemes) public others_insurance_scheme_list;
    mapping(uint256 => mapping(address => uint256)) public amountKept;
    mapping(uint256 => mapping(address => uint256)) public monthKept;
    mapping(uint256 => mapping(address => bool)) public requestPid;
    mapping(uint256 => address) public investors;
    InsuranceSchemes[] insurances;
    uint256 totalCountInvestments = 0;
    uint256 totalCountCarinvestment = 0;
    uint256 totalCountHouseInvestment = 0;
    uint256 totalCountHealthInvestment = 0;
    uint256 totalCountBusinessInvestment = 0;
    uint256 totalCountOthersInvestment = 0;
    uint256 totalInvestors = 0;
    event InsuranceAdded(
        uint256 pid,
        address payable creator,
        string name,
        string description,
        string coverage,
        uint256 min_deposition_amount,
        uint256 deposit_amount_monthwise,
        uint256 duration,
        uint256 totalamount,
        string insurance_type,
        uint256 safe_fees
    );
    event InitialDepositAmount(
        uint256 pid,
        uint256 amount,
        bool success,
        bytes data
    );
    event PaymentSuccess(uint256 pid);
    event RequestSuccess(uint256 pid, bool status);
    event MoneyReturned(uint256 pid, uint256 value, bool success);
    KBRToken kbrtoken;
    People people;

    constructor(address ot, address ot1) {
        kbrtoken = KBRToken(ot);
        people = People(ot1);
        owner = payable(msg.sender);
        kbrtoken.mint(address(this), 30000000 * (10 ** kbrtoken.decimals()));
        kbrtoken.approve(address(this), 300000 * (10 ** kbrtoken.decimals()));
        kbrtoken.allowance(msg.sender, address(this));
    }

    function createInsurance(
        string memory _name,
        string memory _description,
        string memory _coverage,
        uint256 _min_deposit_amount,
        uint256 _deposit_amount_monthwise,
        uint256 _duration,
        string memory _insurance_type,
        uint256 _safe_fees
    ) external payable {
        require(people.isAUser(msg.sender) == true, "invalid user");
        require(
            people.checkUserVerified(msg.sender) == true,
            "only user verified"
        );
        require(
            people.checkUserBlacklisted(msg.sender) == false,
            "shouldnt be blacklisted"
        );
        if (msg.value < _safe_fees) revert InsufficientFundToStartInsurance();

        totalCountInvestments++;
        InsuranceSchemes storage insurancescheme = insurance_scheme_list[
            totalCountInvestments
        ];
        insurancescheme.pid = totalCountInvestments;
        insurancescheme.creator = payable(msg.sender);
        insurancescheme.name = _name;
        insurancescheme.description = _description;
        insurancescheme.coverage = _coverage;

        if (_min_deposit_amount == 0) revert MinimumDepositAmountInvalid();
        insurancescheme.min_deposition_amount = _min_deposit_amount;
        insurancescheme.deposit_amount_monthwise = _deposit_amount_monthwise;
        insurancescheme.safe_fees = _safe_fees;
        amountKept[insurancescheme.pid][msg.sender] = msg.value;
        insurancescheme.duration = _duration;
        insurancescheme.insurance_type = _insurance_type;

        addInsuranceToCategory(insurancescheme);

        insurancescheme.totalamount = msg.value;
        investment_made[insurancescheme.creator].push(insurancescheme);
        insurances.push(insurancescheme);
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            5 * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
        emit InsuranceAdded(
            insurancescheme.pid,
            insurancescheme.creator,
            insurancescheme.name,
            insurancescheme.description,
            insurancescheme.coverage,
            insurancescheme.min_deposition_amount,
            insurancescheme.deposit_amount_monthwise,
            insurancescheme.duration,
            insurancescheme.totalamount,
            insurancescheme.insurance_type,
            insurancescheme.safe_fees
        );
    }

    function addInsuranceToCategory(
        InsuranceSchemes storage insurancescheme
    ) internal {
        if (
            keccak256(abi.encodePacked(insurancescheme.insurance_type)) ==
            keccak256(abi.encodePacked("car"))
        ) {
            totalCountCarinvestment++;
            car_insurance_scheme_list[insurancescheme.pid] = insurancescheme;
        } else if (
            keccak256(abi.encodePacked(insurancescheme.insurance_type)) ==
            keccak256(abi.encodePacked("house"))
        ) {
            totalCountHouseInvestment++;
            home_insurance_scheme_list[insurancescheme.pid] = insurancescheme;
        } else if (
            keccak256(abi.encodePacked(insurancescheme.insurance_type)) ==
            keccak256(abi.encodePacked("business"))
        ) {
            totalCountBusinessInvestment++;
            buisness_insurance_scheme_list[
                insurancescheme.pid
            ] = insurancescheme;
        } else if (
            keccak256(abi.encodePacked(insurancescheme.insurance_type)) ==
            keccak256(abi.encodePacked("health"))
        ) {
            totalCountHealthInvestment++;
            health_insurance_scheme_list[insurancescheme.pid] = insurancescheme;
        } else if (
            keccak256(abi.encodePacked(insurancescheme.insurance_type)) ==
            keccak256(abi.encodePacked("others"))
        ) {
            totalCountOthersInvestment++;
            others_insurance_scheme_list[insurancescheme.pid] = insurancescheme;
        }
    }

    function depositInitialAmount(uint256 _pid) external payable {
        if (_pid > totalCountInvestments) revert NotAValidPid();
        InsuranceSchemes storage insurancescheme = insurance_scheme_list[_pid];
        if (insurancescheme.min_deposition_amount > msg.value)
            revert NotEnoughFund();
        (bool success, bytes memory data) = insurancescheme.creator.call{
            value: msg.value
        }("");
        if (success) {
            insurancescheme.no_of_investors++;
            insurancescheme.totalamount += msg.value;
            investment_bought[msg.sender].push(insurancescheme);
            investors[_pid] = msg.sender;
            amountKept[_pid][msg.sender] = msg.value;
            insurancescheme.inverstorPid.push(msg.sender);
        }
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            2 * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
        emit InitialDepositAmount(_pid, msg.value, success, data);
    }

    function depositMonthly(uint256 _pid) external payable {
        require(people.isAUser(msg.sender) == true, "invalid user");
        require(
            people.checkUserBlacklisted(msg.sender) == false,
            "shouldnt be blacklisted"
        );
        if (_pid > totalCountInvestments) revert NotAValidPid();
        InsuranceSchemes storage insurancescheme = insurance_scheme_list[_pid];
        if (msg.value < insurancescheme.deposit_amount_monthwise)
            revert NotEnoughFund();
        (bool success, ) = insurancescheme.creator.call{value: msg.value}("");
        if (success) {
            if (amountKept[_pid][msg.sender] != 0) {
                amountKept[_pid][msg.sender] += msg.value;
                monthKept[_pid][msg.sender]++;
            }
        }
        kbrtoken.transferFrom(
            address(this),
            msg.sender,
            5 * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
        emit PaymentSuccess(_pid);
    }

    function requestMoney(uint256 _pid) external {
        require(people.isAUser(msg.sender) == true, "invalid user");
        if (_pid > totalCountInvestments) revert NotAValidPid();
        requestPid[_pid][msg.sender] = true;

        emit RequestSuccess(_pid, true);
    }

    function payMoney(
        uint256 _pid,
        address _user,
        uint256 _amount
    ) external payable {
        require(people.isAUser(msg.sender) == true, "invalid user");
        require(
            people.checkUserBlacklisted(_user) == false,
            "shouldnt be blacklisted"
        );
        InsuranceSchemes storage insurancescheme = insurance_scheme_list[_pid];

        if (_pid > totalCountInvestments) revert NotAValidPid();
        if (insurancescheme.creator != msg.sender)
            revert NotValidParticularPid();
        uint256 x = (amountKept[_pid][_user] * 4) / 10;
        require(_amount >= x, "invalid request");
        require(_amount <= amountKept[_pid][_user], "invalid request");
        if (requestPid[_pid][_user] == true) {
            (bool success, ) = _user.call{value: _amount}("");
            if (success) {
                requestPid[_pid][_user] = false;
                amountKept[insurancescheme.pid][_user] -= x;
                kbrtoken.transferFrom(
                    address(this),
                    msg.sender,
                    5 * (10 ** kbrtoken.decimals())
                );
            }

            people.updateUserRating(msg.sender);
            emit MoneyReturned(_pid, _amount, success);
        }
    }

    function getInsurance(
        uint256 _pid
    ) external view returns (InsuranceSchemes memory) {
        if (_pid > totalCountInvestments) revert NotAValidPid();
        return insurance_scheme_list[_pid];
    }

    function withdraw(uint256 _pid) external {
        InsuranceSchemes storage insurancescheme = insurance_scheme_list[_pid];
        require(people.isAUser(msg.sender) == true, "invalid user");
        if (insurancescheme.creator != msg.sender) revert InvalidCreator();

        require(
            address(this).balance >= insurancescheme.safe_fees,
            "Insufficient funds"
        );

        (bool success, ) = insurancescheme.creator.call{
            value: insurancescheme.safe_fees
        }("");
        require(success, "Transfer failed");
    }

    function getAllInsurances()
        public
        view
        returns (InsuranceSchemes[] memory)
    {
        return insurances;
    }

    function getInvestmentsMade(
        address _address
    ) external view returns (InsuranceSchemes[] memory) {
        return investment_made[_address];
    }

    function getInvestmentsBought(
        address _address
    ) external view returns (InsuranceSchemes[] memory) {
        return investment_bought[_address];
    }

    fallback() external payable {}

    receive() external payable {}
}
//MarketPlace-spend to get awesome goods
contract MarketPlace {
    address public immutable owner;
    KBRToken kbrtoken;
    People people;

    constructor(address ot, address ot1) {
        kbrtoken = KBRToken(ot);
        people = People(ot1);
        owner = msg.sender;
    }

    struct Product {
        uint256 pid;
        string name;
        string imageHash;
        string description;
        uint256 price;
        uint256 qty;
    }
    mapping(uint256 => Product) public products;
    Product[] productArray;
    uint256 productCount = 0;

    function createProduct(
        string memory _name,
        string memory _imageHash,
        string memory _description,
        uint256 _price,
        uint256 _qty
    ) external {
        require(msg.sender == owner, "not owner");
        productCount++;
        Product storage product = products[productCount];
        product.pid = productCount;
        product.name = _name;
        product.imageHash = _imageHash;
        product.description = _description;
        product.price = _price;
        product.qty = _qty;
        productArray.push(product);
    }

    function buy(uint256 _pid) external {
        require(_pid <= productCount, "invalid pid");
        require(people.isAUser(msg.sender) == true, "invalid user");
        require(
            people.checkUserBlacklisted(msg.sender) == false,
            "shouldnt be blacklisted"
        );
        require(
            people.getBalance(msg.sender) >=
                (products[_pid].price * (10 ** kbrtoken.decimals())),
            "sorry invalid amt"
        );

         kbrtoken.approve(address(this),products[_pid].price * (10 ** kbrtoken.decimals()));
       

        kbrtoken.transferFrom(
            msg.sender,
            address(this),
            products[_pid].price * (10 ** kbrtoken.decimals())
        );
        people.updateUserRating(msg.sender);
        products[_pid].qty -= 1;
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        uint256 x = people.getBalance(address(this));
        kbrtoken.transferFrom(address(this), msg.sender, x);
    }

    function updateStock(uint256 _pid, uint256 _qty) external {
        require(msg.sender == owner, "not owner");
        require(_pid <= productCount, "invalid pid");
        products[_pid].qty += _qty;
    }

    function getProductById(
        uint256 _id
    ) external view returns (Product memory) {
        Product storage pdt = products[_id];
        return pdt;
    }

    function getProducts() public view returns (Product[] memory) {
        return productArray;
    }
}